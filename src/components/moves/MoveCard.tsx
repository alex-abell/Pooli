"use client";

import { useState } from "react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Loader2,
  X,
} from "lucide-react";

interface MoveCardProps {
  move: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string | null;
    location: string;
    poolId: string;
    createdAt: string;
    _count: {
      rsvps: number;
    };
  };
  initialRsvpStatus: string | null;
  isLoggedIn: boolean;
}

export default function MoveCard({
  move,
  initialRsvpStatus,
  isLoggedIn,
}: MoveCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(
    initialRsvpStatus
  );
  const [rsvpCount, setRsvpCount] = useState(move._count.rsvps);
  const [isLoading, setIsLoading] = useState(false);

  const startDate = new Date(move.startTime);
  const endDate = move.endTime ? new Date(move.endTime) : null;
  const isMovePast = isPast(endDate || startDate);

  const handleRsvp = async (status: string) => {
    if (!isLoggedIn || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/moves/${move.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to RSVP");
      }

      if (status === rsvpStatus) {
        setRsvpStatus(null);
        if (rsvpStatus === "in") {
          setRsvpCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        const wasIn = rsvpStatus === "in";
        const isNowIn = status === "in";

        if (isNowIn && !wasIn) {
          setRsvpCount((prev) => prev + 1);
        } else if (!isNowIn && wasIn) {
          setRsvpCount((prev) => Math.max(0, prev - 1));
        }

        setRsvpStatus(status);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "RSVP error";
      console.error("RSVP error:", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition hover:shadow-md ${
        isMovePast ? "opacity-70" : ""
      }`}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Calendar size={16} />
          <span className="text-sm font-medium">
            {format(startDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        {isMovePast && (
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
            Past
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {move.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {move.description}
        </p>

        <div className="space-y-2 mb-4">
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

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={15} className="text-gray-400 shrink-0" />
            <span>{move.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={15} className="text-gray-400 shrink-0" />
            <span>
              {rsvpCount} {rsvpCount === 1 ? "person" : "people"} in
            </span>
          </div>
        </div>

        {isLoggedIn && !isMovePast && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleRsvp("in")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                rsvpStatus === "in"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : rsvpStatus === "in" ? (
                <Check size={14} />
              ) : null}
              I&apos;m In
            </button>
            <button
              onClick={() => handleRsvp("out")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                rsvpStatus === "out"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : rsvpStatus === "out" ? (
                <X size={14} />
              ) : null}
              Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
