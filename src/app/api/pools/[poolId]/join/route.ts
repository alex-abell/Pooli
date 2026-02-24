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

    const pool = await prisma.group.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId: poolId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this pool" },
        { status: 409 }
      );
    }

    const membership = await prisma.membership.create({
      data: {
        userId,
        groupId: poolId,
        role: "member",
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
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

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId: poolId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this pool" },
        { status: 404 }
      );
    }

    if (membership.role === "owner") {
      return NextResponse.json(
        { error: "The pool host cannot leave the pool" },
        { status: 403 }
      );
    }

    await prisma.membership.delete({
      where: {
        userId_groupId: { userId, groupId: poolId },
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
