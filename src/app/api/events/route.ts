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

    const events = await prisma.event.findMany({
      where: { groupId },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
    const { title, description, startTime, endTime, location, isOnline, meetingUrl, groupId } =
      await req.json();

    if (!title || !description || !startTime || !groupId) {
      return NextResponse.json(
        { error: "Title, description, startTime, and groupId are required" },
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
        { error: "Only group owners and admins can create events" },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location || null,
        isOnline: isOnline ?? true,
        meetingUrl: meetingUrl || null,
        groupId,
      },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
