import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { poolId: string } }
) {
  try {
    const { poolId } = params;

    const pool = await prisma.group.findUnique({
      where: { id: poolId },
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pool);
  } catch (error) {
    console.error("Error fetching pool:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    if (pool.ownerId !== userId) {
      return NextResponse.json(
        { error: "Only the pool host can update this pool" },
        { status: 403 }
      );
    }

    const { name, description, image } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const updatedPool = await prisma.group.update({
      where: { id: poolId },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    return NextResponse.json(updatedPool);
  } catch (error) {
    console.error("Error updating pool:", error);
    return NextResponse.json(
      { error: "Failed to update pool" },
      { status: 500 }
    );
  }
}
