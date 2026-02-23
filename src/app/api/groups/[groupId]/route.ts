import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    if (group.ownerId !== userId) {
      return NextResponse.json(
        { error: "Only the group owner can update this group" },
        { status: 403 }
      );
    }

    const { name, description, image, privacy } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (privacy !== undefined) updateData.privacy = privacy;

    if (name) {
      updateData.slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}
