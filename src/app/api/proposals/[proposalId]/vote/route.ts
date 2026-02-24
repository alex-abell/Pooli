import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { proposalId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const { proposalId } = params;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId: proposal.poolId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this pool to vote" },
        { status: 403 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_memberId: { proposalId, memberId: membership.id },
      },
    });

    if (existingVote) {
      const [, updatedProposal] = await prisma.$transaction([
        prisma.vote.delete({
          where: { id: existingVote.id },
        }),
        prisma.proposal.update({
          where: { id: proposalId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        voted: false,
        voteCount: updatedProposal.voteCount,
      });
    } else {
      const [, updatedProposal] = await prisma.$transaction([
        prisma.vote.create({
          data: {
            proposalId,
            memberId: membership.id,
          },
        }),
        prisma.proposal.update({
          where: { id: proposalId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({
        voted: true,
        voteCount: updatedProposal.voteCount,
      });
    }
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
}
