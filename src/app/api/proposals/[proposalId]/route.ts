import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        votes: {
          include: {
            member: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
        pool: {
          select: { id: true, name: true },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status } = await req.json();

    const validStatuses = ["submitted", "approved", "funded", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: submitted, approved, funded, completed" },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        pool: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (proposal.pool.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the pool host can update proposal status" },
        { status: 403 }
      );
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        pool: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}
