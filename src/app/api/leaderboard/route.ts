import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId query parameter is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const leaderboard = await prisma.membership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { points: "desc" },
      take: 50,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
