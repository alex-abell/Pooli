import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import LogContributionModal from "@/components/stash/LogContributionModal";

interface StashPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function StashPage({ params }: StashPageProps) {
  const { poolId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    select: { id: true, hostId: true, contributionAmount: true },
  });

  if (!pool) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">Pool not found.</p>
      </div>
    );
  }

  const membership = userId
    ? await prisma.member.findUnique({
        where: { userId_poolId: { userId, poolId } },
        select: { id: true, role: true },
      })
    : null;

  const isHost = membership?.role === "owner";

  // Fetch all stash data in parallel
  const [
    contributionsAgg,
    disbursementsAgg,
    recentTransactions,
    contributions,
    members,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { poolId, type: "contribution" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { poolId, type: "disbursement" },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { poolId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        move: { select: { id: true, title: true } },
      },
    }),
    prisma.contribution.findMany({
      where: { poolId },
      orderBy: { date: "desc" },
      take: 20,
      include: {
        member: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
    }),
    isHost
      ? prisma.member.findMany({
          where: { poolId, status: "active" },
          select: { id: true, user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: "asc" },
        })
      : [],
  ]);

  const totalIn = contributionsAgg._sum.amount || 0;
  const totalOut = disbursementsAgg._sum.amount || 0;
  const balance = totalIn - totalOut;

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stash</h1>
            <p className="text-gray-500 text-sm">
              Pool treasury and contribution history
            </p>
          </div>
        </div>
        {isHost && <LogContributionModal poolId={poolId} members={members} />}
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Wallet size={14} />
            Balance
          </div>
          <p className="text-2xl font-bold text-gray-900">${balance}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp size={14} className="text-green-500" />
            Total In
          </div>
          <p className="text-2xl font-bold text-green-600">${totalIn}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingDown size={14} className="text-red-500" />
            Total Out
          </div>
          <p className="text-2xl font-bold text-red-500">${totalOut}</p>
        </div>
      </div>

      {pool.contributionAmount > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center gap-3">
          <DollarSign size={18} className="text-blue-600" />
          <p className="text-sm text-blue-800">
            Monthly contribution: <strong>${pool.contributionAmount}</strong> per member
          </p>
        </div>
      )}

      {/* Recent Contributions */}
      {contributions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent Contributions
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {c.member.user.image ? (
                      <img
                        src={c.member.user.image}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-green-700">
                        {c.member.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.member.user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(c.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +${c.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transaction History */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Transaction History
        </h2>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Wallet size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No transactions yet. Contributions will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "contribution"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {tx.type === "contribution" ? (
                      <ArrowRight
                        size={14}
                        className="text-green-600 -rotate-90"
                      />
                    ) : (
                      <ArrowRight
                        size={14}
                        className="text-red-500 rotate-90"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    tx.type === "contribution"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {tx.type === "contribution" ? "+" : "-"}${tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
