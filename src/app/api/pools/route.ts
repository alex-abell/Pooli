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

    const pools = await prisma.group.findMany({
      where: {
        memberships: { some: { userId } },
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { memberships: true },
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
    const { name, description, image } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);

    const pool = await prisma.group.create({
      data: {
        name,
        slug,
        description,
        image: image || null,
        privacy: "private",
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { memberships: true },
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
