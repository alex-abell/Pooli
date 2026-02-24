import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { poolId: string } }
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
    const { poolId } = params;

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    const existingMember = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this pool" },
        { status: 409 }
      );
    }

    const member = await prisma.member.create({
      data: {
        userId,
        poolId,
        role: "member",
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        pool: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error joining pool:", error);
    return NextResponse.json(
      { error: "Failed to join pool" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { poolId: string } }
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
    const { poolId } = params;

    const member = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this pool" },
        { status: 404 }
      );
    }

    if (member.role === "owner") {
      return NextResponse.json(
        { error: "The pool host cannot leave the pool" },
        { status: 403 }
      );
    }

    await prisma.member.delete({
      where: {
        userId_poolId: { userId, poolId },
      },
    });

    return NextResponse.json({ message: "Successfully left the pool" });
  } catch (error) {
    console.error("Error leaving pool:", error);
    return NextResponse.json(
      { error: "Failed to leave pool" },
      { status: 500 }
    );
  }
}
