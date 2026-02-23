import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      where: { privacy: "public" },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
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
    const { name, description, image, privacy } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existingGroup = await prisma.group.findUnique({
      where: { slug },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "A group with a similar name already exists" },
        { status: 409 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        slug,
        description,
        image: image || null,
        privacy: privacy || "public",
        ownerId: userId,
        memberships: {
          create: {
            userId,
            role: "owner",
          },
        },
        categories: {
          createMany: {
            data: [
              { name: "General", emoji: "💬" },
              { name: "Questions", emoji: "❓" },
              { name: "Wins", emoji: "🏆" },
              { name: "Resources", emoji: "📚" },
            ],
          },
        },
      },
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

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
