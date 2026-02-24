import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    const pools = await prisma.pool.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        host: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pools);
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
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
    const { name, description, image, contributionAmount } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const pool = await prisma.pool.create({
      data: {
        name,
        description,
        image: image || null,
        contributionAmount: contributionAmount || 0,
        hostId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      include: {
        host: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json(pool, { status: 201 });
  } catch (error) {
    console.error("Error creating pool:", error);
    return NextResponse.json(
      { error: "Failed to create pool" },
      { status: 500 }
    );
  }
}
