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

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    const members = await prisma.member.findMany({
      where: { poolId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
