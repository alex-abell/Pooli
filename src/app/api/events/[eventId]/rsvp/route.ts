import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
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
    const { eventId } = params;
    const { status } = await req.json();

    if (!status || !["going", "maybe", "not_going"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: going, maybe, not_going" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId: event.groupId },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this group to RSVP" },
        { status: 403 }
      );
    }

    const rsvp = await prisma.eventRsvp.upsert({
      where: {
        userId_eventId: { userId, eventId },
      },
      create: {
        userId,
        eventId,
        status,
      },
      update: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error("Error RSVPing to event:", error);
    return NextResponse.json(
      { error: "Failed to RSVP to event" },
      { status: 500 }
    );
  }
}
