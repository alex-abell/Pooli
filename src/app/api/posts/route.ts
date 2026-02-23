import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const categoryId = searchParams.get("categoryId");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId query parameter is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { groupId };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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
    const { title, content, groupId, categoryId } = await req.json();

    if (!title || !content || !groupId) {
      return NextResponse.json(
        { error: "Title, content, and groupId are required" },
        { status: 400 }
      );
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this group to create a post" },
        { status: 403 }
      );
    }

    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          title,
          content,
          authorId: userId,
          groupId,
          categoryId: categoryId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.membership.update({
        where: {
          userId_groupId: { userId, groupId },
        },
        data: {
          points: { increment: 2 },
        },
      }),
    ]);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
