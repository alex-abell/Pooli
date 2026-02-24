import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon } from "lucide-react";
import MoveCard from "@/components/moves/MoveCard";
import CreateMoveModal from "@/components/moves/CreateMoveModal";

interface MovesPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function MovesPage({ params }: MovesPageProps) {
  const { poolId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const pool = await prisma.group.findUnique({
    where: { id: poolId },
    select: { id: true, name: true },
  });

  if (!pool) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">Pool not found.</p>
      </div>
    );
  }

  const membership = userId
    ? await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId: poolId } },
        select: { role: true },
      })
    : null;

  const isHost = membership?.role === "owner";

  const events = await prisma.event.findMany({
    where: { groupId: poolId },
    include: {
      _count: { select: { rsvps: true } },
      rsvps: userId ? { where: { userId } } : false,
    },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const upcomingMoves = events.filter(
    (e) => new Date(e.startTime) >= now
  );
  const pastMoves = events
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
            <h1 className="text-2xl font-bold text-gray-900">Moves</h1>
            <p className="text-gray-500 text-sm">
              Upcoming activities and gatherings
            </p>
          </div>
        </div>
        {isHost && <CreateMoveModal poolId={poolId} />}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No moves yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            {isHost
              ? "Create your first move to get the Pool going."
              : "Check back later for upcoming moves."}
          </p>
        </div>
      ) : (
        <>
          {upcomingMoves.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Upcoming Moves
              </h2>
              <div className="space-y-4">
                {upcomingMoves.map((event) => (
                  <MoveCard
                    key={event.id}
                    move={{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      startTime: event.startTime.toISOString(),
                      endTime: event.endTime?.toISOString() || null,
                      location: event.location || "TBD",
                      poolId: event.groupId,
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

          {pastMoves.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Past Moves
              </h2>
              <div className="space-y-4">
                {pastMoves.map((event) => (
                  <MoveCard
                    key={event.id}
                    move={{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      startTime: event.startTime.toISOString(),
                      endTime: event.endTime?.toISOString() || null,
                      location: event.location || "TBD",
                      poolId: event.groupId,
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
