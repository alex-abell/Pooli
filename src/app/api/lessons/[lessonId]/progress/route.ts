import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
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
    const { lessonId } = params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const groupId = lesson.module.course.groupId;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this group to track progress" },
        { status: 403 }
      );
    }

    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (existingProgress?.completed) {
      return NextResponse.json({
        message: "Lesson already completed",
        progress: existingProgress,
      });
    }

    const [progress] = await prisma.$transaction([
      prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId },
        },
        create: {
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
      }),
      prisma.membership.update({
        where: {
          userId_groupId: { userId, groupId },
        },
        data: {
          points: { increment: 5 },
        },
      }),
    ]);

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error("Error marking lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson progress" },
      { status: 500 }
    );
  }
}
