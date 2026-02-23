"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserPlus, Loader2 } from "lucide-react";

interface JoinGroupBarProps {
  groupId: string;
  groupName: string;
}

export default function JoinGroupBar({ groupId, groupName }: JoinGroupBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to join group.");
        setIsJoining(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsJoining(false);
    }
  }

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-800">
            You are not a member of{" "}
            <span className="font-semibold">{groupName}</span>. Join to post,
            comment, and participate.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="ml-4 shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Join Group
            </>
          )}
        </button>
      </div>
    </div>
  );
}
