"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Crown,
  Shield,
  Star,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";

interface Member {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  email: string | null;
  role: string;
  points: number;
  joinedAt: string;
}

interface MembersSearchProps {
  members: Member[];
}

const roleOrder: Record<string, number> = {
  owner: 0,
  admin: 1,
  moderator: 2,
  member: 3,
};

export default function MembersSearch({ members }: MembersSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredMembers = useMemo(() => {
    let result = members;

    // Filter by role
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          (m.email && m.email.toLowerCase().includes(query))
      );
    }

    // Sort: owners first, then admins, then moderators, then members; within each role by points desc
    result.sort((a, b) => {
      const roleA = roleOrder[a.role] ?? 99;
      const roleB = roleOrder[b.role] ?? 99;
      if (roleA !== roleB) return roleA - roleB;
      return b.points - a.points;
    });

    return result;
  }, [members, searchQuery, roleFilter]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
            <Crown size={10} />
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
            <Shield size={10} />
            Admin
          </span>
        );
      case "moderator":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
            <Star size={10} />
            Mod
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
            Member
          </span>
        );
    }
  };

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "owner", label: "Owners" },
    { value: "admin", label: "Admins" },
    { value: "moderator", label: "Moderators" },
    { value: "member", label: "Members" },
  ];

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results info */}
      {(searchQuery || roleFilter !== "all") && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredMembers.length} of {members.length} members
          {searchQuery && (
            <span>
              {" "}
              matching &quot;{searchQuery}&quot;
            </span>
          )}
        </p>
      )}

      {/* Members grid */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <UserIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No members found
          </h3>
          <p className="text-gray-500 text-sm">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Name and role */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {member.name}
                  </h3>
                  <div className="mt-1">{getRoleBadge(member.role)}</div>
                </div>
              </div>

              {/* Points and joined date */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Trophy size={12} className="text-yellow-500" />
                  <span className="font-medium text-gray-700">
                    {member.points.toLocaleString()} pts
                  </span>
                </div>
                <span>
                  Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
