import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { content, postId, parentId } = await req.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: "Content and postId are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this post" },
          { status: 400 }
        );
      }
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId: post.groupId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this group to comment" },
        { status: 403 }
      );
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
          parentId: parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.membership.update({
        where: {
          userId_groupId: { userId, groupId: post.groupId },
        },
        data: {
          points: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
