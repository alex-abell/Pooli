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

    const moves = await prisma.move.findMany({
      where: { poolId },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(moves);
  } catch (error) {
    console.error("Error fetching moves:", error);
    return NextResponse.json(
      { error: "Failed to fetch moves" },
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
    const { title, description, startTime, endTime, location, cost, poolId } =
      await req.json();

    if (!title || !description || !startTime || !poolId || !location) {
      return NextResponse.json(
        { error: "Title, description, startTime, location, and poolId are required" },
        { status: 400 }
      );
    }

    const membership = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId },
      },
    });

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the pool host can create moves" },
        { status: 403 }
      );
    }

    const move = await prisma.move.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location,
        cost: cost || 0,
        poolId,
      },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    });

    return NextResponse.json(move, { status: 201 });
  } catch (error) {
    console.error("Error creating move:", error);
    return NextResponse.json(
      { error: "Failed to create move" },
      { status: 500 }
    );
  }
}
