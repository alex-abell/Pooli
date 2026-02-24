import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  DollarSign,
} from "lucide-react";

interface PoolHomeProps {
  params: Promise<{ poolId: string }>;
}

export default async function PoolHome({ params }: PoolHomeProps) {
  const { poolId } = await params;

  // Fetch all data in parallel
  const [nextMove, stashData, activeProposals, recentTransactions] =
    await Promise.all([
      // Next upcoming move with opted-in count
      prisma.move.findFirst({
        where: { poolId, status: "upcoming", startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        include: {
          rsvps: { where: { status: "in" }, select: { id: true } },
        },
      }),

      // Stash balance calculations
      Promise.all([
        prisma.transaction.aggregate({
          where: { poolId, type: "contribution" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { poolId, type: "disbursement" },
          _sum: { amount: true },
        }),
        prisma.proposal.findFirst({
          where: { poolId, status: "approved" },
          orderBy: { estimatedCost: "asc" },
          select: { id: true, title: true, estimatedCost: true },
        }),
      ]),

      // Active proposals
      prisma.proposal.findMany({
        where: { poolId, status: { in: ["submitted", "approved"] } },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { voteCount: "desc" },
        take: 5,
      }),

      // Recent activity
      prisma.transaction.findMany({
        where: { poolId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          move: { select: { id: true, title: true } },
        },
      }),
    ]);

  const totalIn = stashData[0]._sum.amount || 0;
  const totalOut = stashData[1]._sum.amount || 0;
  const balance = totalIn - totalOut;
  const nextApproved = stashData[2];
  const progressPercent = nextApproved
    ? Math.min(100, Math.round((balance / nextApproved.estimatedCost) * 100))
    : 0;

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Next Move */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Next Move
          </h2>
          <Link
            href={`/pools/${poolId}/moves`}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Moves <ChevronRight size={14} />
          </Link>
        </div>

        {nextMove ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {nextMove.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {format(new Date(nextMove.startTime), "EEE, MMM d 'at' h:mm a")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" />
                    {nextMove.location}
                  </span>
                </div>
                {nextMove.description && (
                  <p className="text-gray-600 mt-3 text-sm line-clamp-2">
                    {nextMove.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-xl px-4 py-3 flex-shrink-0">
                <Users size={18} className="text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {nextMove.rsvps.length}
                </span>
                <span className="text-xs text-blue-500">opted in</span>
              </div>
            </div>

            {nextMove.cost > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <DollarSign size={14} />
                ${nextMove.cost} from the Stash
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No upcoming moves</p>
          </div>
        )}
      </section>

      {/* Stash Balance + Active Proposals side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stash Balance */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Stash
            </h2>
            <Link
              href={`/pools/${poolId}/stash`}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Details <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-gray-900">${balance}</p>
              </div>
            </div>

            {nextApproved && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span className="truncate mr-2">Toward: {nextApproved.title}</span>
                  <span className="flex-shrink-0">${balance} / ${nextApproved.estimatedCost}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
              <div>
                <span className="text-gray-400">In</span>{" "}
                <span className="font-medium text-green-600">${totalIn}</span>
              </div>
              <div>
                <span className="text-gray-400">Out</span>{" "}
                <span className="font-medium text-red-500">${totalOut}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Proposals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Proposals
            </h2>
            <Link
              href={`/pools/${poolId}/proposals`}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {activeProposals.length === 0 ? (
              <div className="p-8 text-center">
                <Lightbulb size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active proposals</p>
              </div>
            ) : (
              activeProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {proposal.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          proposal.status === "approved"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {proposal.status}
                      </span>
                      {proposal.estimatedCost > 0 && (
                        <span className="text-xs text-gray-400">
                          ${proposal.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {proposal.voteCount}
                    </span>
                    <span className="text-xs">votes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recent Activity
        </h2>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">No activity yet</p>
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
                      <ArrowRight size={14} className="text-green-600 -rotate-90" />
                    ) : (
                      <ArrowRight size={14} className="text-red-500 rotate-90" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(tx.createdAt), "MMM d, h:mm a")}
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
