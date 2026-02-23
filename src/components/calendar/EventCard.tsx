"use client";

import { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string | null;
    location: string | null;
    isOnline: boolean;
    meetingUrl: string | null;
    groupId: string;
    createdAt: string;
    _count: {
      rsvps: number;
    };
  };
  initialRsvpStatus: string | null; // "going", "maybe", "not_going", or null
  isLoggedIn: boolean;
}

export default function EventCard({
  event,
  initialRsvpStatus,
  isLoggedIn,
}: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(
    initialRsvpStatus
  );
  const [rsvpCount, setRsvpCount] = useState(event._count.rsvps);
  const [isLoading, setIsLoading] = useState(false);

  const startDate = new Date(event.startTime);
  const endDate = event.endTime ? new Date(event.endTime) : null;
  const isEventPast = isPast(endDate || startDate);

  const handleRsvp = async (status: string) => {
    if (!isLoggedIn || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to RSVP");
      }

      const data = await res.json();

      if (status === rsvpStatus) {
        // Toggle off: if same status clicked, remove RSVP
        setRsvpStatus(null);
        setRsvpCount((prev) => Math.max(0, prev - 1));
      } else {
        // Set new status
        const wasPreviouslyRsvpd = rsvpStatus === "going";
        const isNowGoing = status === "going";

        if (isNowGoing && !wasPreviouslyRsvpd) {
          setRsvpCount((prev) => prev + 1);
        } else if (!isNowGoing && wasPreviouslyRsvpd) {
          setRsvpCount((prev) => Math.max(0, prev - 1));
        }

        setRsvpStatus(status);
      }
    } catch (err: any) {
      console.error("RSVP error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition hover:shadow-md ${
        isEventPast ? "opacity-70" : ""
      }`}
    >
      {/* Date stripe at top */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Calendar size={16} />
          <span className="text-sm font-medium">
            {format(startDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        {isEventPast && (
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
            Past
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Title and description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Event details */}
        <div className="space-y-2 mb-4">
          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={15} className="text-gray-400 shrink-0" />
            <span>
              {format(startDate, "h:mm a")}
              {endDate && ` - ${format(endDate, "h:mm a")}`}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 text-xs">
              {isPast(startDate)
                ? `${formatDistanceToNow(startDate)} ago`
                : `in ${formatDistanceToNow(startDate)}`}
            </span>
          </div>

          {/* Location */}
          {event.isOnline ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video size={15} className="text-gray-400 shrink-0" />
              <span className="inline-flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  Online
                </span>
                {event.meetingUrl && (
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Join Meeting
                    <ExternalLink size={10} />
                  </a>
                )}
              </span>
            </div>
          ) : event.location ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <span>{event.location}</span>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                In-Person
              </span>
            </div>
          ) : null}

          {/* RSVP count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={15} className="text-gray-400 shrink-0" />
            <span>
              {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
            </span>
          </div>
        </div>

        {/* RSVP Buttons */}
        {isLoggedIn && !isEventPast && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleRsvp("going")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                rsvpStatus === "going"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : rsvpStatus === "going" ? (
                <Check size={14} />
              ) : null}
              Going
            </button>
            <button
              onClick={() => handleRsvp("maybe")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                rsvpStatus === "maybe"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : rsvpStatus === "maybe" ? (
                <Check size={14} />
              ) : null}
              Maybe
            </button>
            <button
              onClick={() => handleRsvp("not_going")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                rsvpStatus === "not_going"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : rsvpStatus === "not_going" ? (
                <Check size={14} />
              ) : null}
              Can&apos;t Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
