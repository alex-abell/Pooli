import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
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
    const { groupId } = params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 409 }
      );
    }

    const membership = await prisma.membership.create({
      data: {
        userId,
        groupId,
        role: "member",
        points: 1,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string } }
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
    const { groupId } = params;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 404 }
      );
    }

    if (membership.role === "owner") {
      return NextResponse.json(
        { error: "The group owner cannot leave the group" },
        { status: 403 }
      );
    }

    await prisma.membership.delete({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    return NextResponse.json({ message: "Successfully left the group" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }
}
