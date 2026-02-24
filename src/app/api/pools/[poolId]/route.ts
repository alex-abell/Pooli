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

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      include: {
        host: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { members: true },
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

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    if (pool.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the pool host can update this pool" },
        { status: 403 }
      );
    }

    const { name, description, image, contributionAmount } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (contributionAmount !== undefined) updateData.contributionAmount = contributionAmount;

    const updatedPool = await prisma.pool.update({
      where: { id: poolId },
      data: updateData,
      include: {
        host: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { members: true },
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
