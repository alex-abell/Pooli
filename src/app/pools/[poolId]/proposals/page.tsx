import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Lightbulb } from "lucide-react";
import ProposalCard from "@/components/proposals/ProposalCard";
import CreateProposalModal from "@/components/proposals/CreateProposalModal";

interface ProposalsPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function ProposalsPage({ params }: ProposalsPageProps) {
  const { poolId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    select: { id: true, hostId: true },
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

  const isMember = !!membership;
  const isHost = membership?.role === "owner";

  const proposals = await prisma.proposal.findMany({
    where: { poolId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      votes: membership ? { where: { memberId: membership.id }, select: { id: true } } : false,
    },
    orderBy: [{ status: "asc" }, { voteCount: "desc" }],
  });

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Lightbulb size={20} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-500 text-sm">
              Suggest how to spend the Stash
            </p>
          </div>
        </div>
        {isMember && <CreateProposalModal poolId={poolId} />}
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lightbulb size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No proposals yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            {isMember
              ? "Be the first to propose how the Pool should spend its Stash."
              : "Join this Pool to submit proposals."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={{
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                estimatedCost: proposal.estimatedCost,
                status: proposal.status,
                voteCount: proposal.voteCount,
                author: proposal.author,
                createdAt: proposal.createdAt.toISOString(),
              }}
              isHost={isHost}
              isMember={isMember}
              initialVoted={
                Array.isArray(proposal.votes) && proposal.votes.length > 0
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
