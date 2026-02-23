import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId query parameter is required" },
        { status: 400 }
      );
    }

    const courses = await prisma.course.findMany({
      where: { groupId },
      include: {
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
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
    const { title, description, image, groupId, published } = await req.json();

    if (!title || !description || !groupId) {
      return NextResponse.json(
        { error: "Title, description, and groupId are required" },
        { status: 400 }
      );
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json(
        { error: "Only group owners and admins can create courses" },
        { status: 403 }
      );
    }

    const courseCount = await prisma.course.count({
      where: { groupId },
    });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image: image || null,
        published: published ?? false,
        groupId,
        order: courseCount,
      },
      include: {
        _count: {
          select: { modules: true },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
