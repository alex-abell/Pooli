"use client";

import { useState } from "react";
import { ThumbsUp, Check, DollarSign } from "lucide-react";

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    description: string;
    estimatedCost: number;
    status: string;
    voteCount: number;
    author: { id: string; name: string; image: string | null };
    createdAt: string;
  };
  isHost: boolean;
  isMember: boolean;
  initialVoted: boolean;
}

export default function ProposalCard({
  proposal,
  isHost,
  isMember,
  initialVoted,
}: ProposalCardProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(proposal.voteCount);
  const [status, setStatus] = useState(proposal.status);
  const [voting, setVoting] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleVote = async () => {
    if (!isMember || voting) return;
    setVoting(true);

    try {
      const res = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setVoted(data.voted);
        setVoteCount(data.voteCount);
      }
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setVoting(false);
    }
  };

  const handleApprove = async () => {
    if (!isHost || approving) return;
    setApproving(true);

    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        setStatus("approved");
      }
    } catch (error) {
      console.error("Approve failed:", error);
    } finally {
      setApproving(false);
    }
  };

  const statusColors: Record<string, string> = {
    submitted: "bg-amber-50 text-amber-700",
    approved: "bg-green-50 text-green-700",
    funded: "bg-blue-50 text-blue-700",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[status] || "bg-gray-100 text-gray-600"}`}
            >
              {status}
            </span>
            {proposal.estimatedCost > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <DollarSign size={12} />
                {proposal.estimatedCost}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {proposal.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
            {proposal.description}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            by {proposal.author.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        {isMember && (
          <button
            onClick={handleVote}
            disabled={voting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              voted
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ThumbsUp size={16} />
            {voteCount}
          </button>
        )}

        {!isMember && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ThumbsUp size={16} />
            {voteCount} votes
          </div>
        )}

        {isHost && status === "submitted" && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <Check size={16} />
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
