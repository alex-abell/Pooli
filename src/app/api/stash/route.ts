import { NextResponse } from "next/server";
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

    const [
      contributionsAggregate,
      disbursementsAggregate,
      nextApprovedProposal,
      recentTransactions,
    ] = await Promise.all([
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
      prisma.transaction.findMany({
        where: { poolId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          move: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    const totalContributions = contributionsAggregate._sum.amount || 0;
    const totalDisbursements = disbursementsAggregate._sum.amount || 0;
    const balance = totalContributions - totalDisbursements;

    return NextResponse.json({
      balance,
      totalContributions,
      totalDisbursements,
      nextApprovedProposal,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching stash overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch stash overview" },
      { status: 500 }
    );
  }
}
