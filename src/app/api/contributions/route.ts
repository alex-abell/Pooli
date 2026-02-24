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

    const contributions = await prisma.contribution.findMany({
      where: { poolId },
      include: {
        member: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
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
    const { poolId, memberId, amount } = await req.json();

    if (!poolId || !memberId || !amount) {
      return NextResponse.json(
        { error: "poolId, memberId, and amount are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    if (pool.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the pool host can log contributions" },
        { status: 403 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!member || member.poolId !== poolId) {
      return NextResponse.json(
        { error: "Member not found in this pool" },
        { status: 404 }
      );
    }

    const [contribution] = await prisma.$transaction([
      prisma.contribution.create({
        data: {
          memberId,
          poolId,
          amount,
          status: "completed",
        },
        include: {
          member: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      }),
      prisma.transaction.create({
        data: {
          poolId,
          type: "contribution",
          amount,
          description: `${member.user.name} contributed $${amount}`,
        },
      }),
    ]);

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json(
      { error: "Failed to create contribution" },
      { status: 500 }
    );
  }
}
