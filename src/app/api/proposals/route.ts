import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json(
        { error: "poolId query parameter is required" },
        { status: 400 }
      );
    }

    const proposals = await prisma.proposal.findMany({
      where: { poolId },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [{ status: "asc" }, { voteCount: "desc" }],
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const { poolId, title, description, estimatedCost } = await req.json();

    if (!title || !description || !poolId) {
      return NextResponse.json(
        { error: "Title, description, and poolId are required" },
        { status: 400 }
      );
    }

    const membership = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this pool to create a proposal" },
        { status: 403 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        poolId,
        authorId: userId,
        title,
        description,
        estimatedCost: estimatedCost || 0,
        status: "submitted",
        voteCount: 0,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
