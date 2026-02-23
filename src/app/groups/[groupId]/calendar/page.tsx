import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon } from "lucide-react";
import EventCard from "@/components/calendar/EventCard";
import CreateEventModal from "@/components/calendar/CreateEventModal";

interface CalendarPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { groupId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
  });

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  const membership = userId
    ? await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true },
      })
    : null;

  const isOwnerOrAdmin =
    membership?.role === "owner" || membership?.role === "admin";

  const events = await prisma.event.findMany({
    where: { groupId },
    include: {
      _count: { select: { rsvps: true } },
      rsvps: userId ? { where: { userId } } : false,
    },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.startTime) >= now
  );
  const pastEvents = events
    .filter((e) => new Date(e.startTime) < now)
    .reverse();

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <CalendarIcon size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-500 text-sm">
              Upcoming events and gatherings
            </p>
          </div>
        </div>
        {isOwnerOrAdmin && <CreateEventModal groupId={groupId} />}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No events yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            {isOwnerOrAdmin
              ? "Create your first event to bring the community together."
              : "Check back later for upcoming community events."}
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      startTime: event.startTime.toISOString(),
                      endTime: event.endTime?.toISOString() || null,
                      location: event.location,
                      isOnline: event.isOnline,
                      meetingUrl: event.meetingUrl,
                      groupId: event.groupId,
                      createdAt: event.createdAt.toISOString(),
                      _count: { rsvps: event._count.rsvps },
                    }}
                    initialRsvpStatus={
                      Array.isArray(event.rsvps) && event.rsvps.length > 0
                        ? event.rsvps[0].status
                        : null
                    }
                    isLoggedIn={!!session}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Past Events
              </h2>
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      startTime: event.startTime.toISOString(),
                      endTime: event.endTime?.toISOString() || null,
                      location: event.location,
                      isOnline: event.isOnline,
                      meetingUrl: event.meetingUrl,
                      groupId: event.groupId,
                      createdAt: event.createdAt.toISOString(),
                      _count: { rsvps: event._count.rsvps },
                    }}
                    initialRsvpStatus={
                      Array.isArray(event.rsvps) && event.rsvps.length > 0
                        ? event.rsvps[0].status
                        : null
                    }
                    isLoggedIn={!!session}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
