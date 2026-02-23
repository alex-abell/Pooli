"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Calendar } from "lucide-react";

interface CreateEventModalProps {
  groupId: string;
}

export default function CreateEventModal({ groupId }: CreateEventModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
    setError("");
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setIsOnline(true);
    setMeetingUrl("");
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!startTime) {
      setError("Start time is required.");
      return;
    }
    if (endTime && new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: endTime ? new Date(endTime).toISOString() : null,
          location: !isOnline && location.trim() ? location.trim() : null,
          isOnline,
          meetingUrl: isOnline && meetingUrl.trim() ? meetingUrl.trim() : null,
          groupId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
      >
        <Plus size={18} />
        Create Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Create Event
                  </h2>
                  <p className="text-sm text-gray-500">
                    Schedule a new event for the group
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="event-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Community Call"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  maxLength={200}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="event-description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event details..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  maxLength={2000}
                />
              </div>

              {/* Start and End time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="event-start"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Start Time
                  </label>
                  <input
                    id="event-start"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-end"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    End Time{" "}
                    <span className="text-gray-400 font-normal">(opt.)</span>
                  </label>
                  <input
                    id="event-end"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Online/In-Person toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setIsOnline(true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      isOnline
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOnline(false)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                      !isOnline
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    In Person
                  </button>
                </div>

                {/* Meeting URL (if online) */}
                {isOnline ? (
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="Meeting URL (optional) - e.g. https://zoom.us/j/..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                ) : (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location - e.g. 123 Main St, City"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    maxLength={300}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !title.trim() ||
                    !description.trim() ||
                    !startTime
                  }
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
