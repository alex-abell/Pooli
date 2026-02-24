import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
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
    const { moveId } = params;
    const { status } = await req.json();

    if (!status || !["in", "out"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: in, out" },
        { status: 400 }
      );
    }

    const move = await prisma.move.findUnique({
      where: { id: moveId },
    });

    if (!move) {
      return NextResponse.json(
        { error: "Move not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId: move.poolId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this pool to RSVP" },
        { status: 403 }
      );
    }

    const rsvp = await prisma.rsvp.upsert({
      where: {
        userId_moveId: { userId, moveId },
      },
      create: {
        userId,
        moveId,
        status,
      },
      update: {
        status,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        move: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error("Error RSVPing to move:", error);
    return NextResponse.json(
      { error: "Failed to RSVP to move" },
      { status: 500 }
    );
  }
}
