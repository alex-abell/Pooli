import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Shield,
  User as UserIcon,
} from "lucide-react";

interface LeaderboardPageProps {
  params: { groupId: string };
}

export default async function LeaderboardPage({
  params,
}: LeaderboardPageProps) {
  const { groupId } = params;
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

  const memberships = await prisma.membership.findMany({
    where: { groupId },
    orderBy: { points: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
    },
  });

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
          border: "border-yellow-200",
          badge: "bg-yellow-400 text-yellow-900",
          text: "text-yellow-700",
          icon: <Crown size={20} className="text-yellow-500" />,
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          border: "border-gray-300",
          badge: "bg-gray-300 text-gray-700",
          text: "text-gray-600",
          icon: <Medal size={20} className="text-gray-400" />,
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-orange-50 to-amber-50",
          border: "border-orange-200",
          badge: "bg-orange-300 text-orange-800",
          text: "text-orange-600",
          icon: <Medal size={20} className="text-orange-400" />,
        };
      default:
        return {
          bg: "bg-white",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-600",
          text: "text-gray-500",
          icon: null,
        };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            <Crown size={10} />
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <Shield size={10} />
            Admin
          </span>
        );
      case "moderator":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <Star size={10} />
            Mod
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-500 text-sm">
              Top members ranked by points
            </p>
          </div>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Trophy size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No members yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            The leaderboard will populate as members join and earn points.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Top 3 highlight section */}
          {memberships.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Second place */}
              <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 mt-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-sm font-bold mb-2">
                  2
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                  {memberships[1].user.image ? (
                    <img
                      src={memberships[1].user.image}
                      alt={memberships[1].user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} className="text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate w-full text-center">
                  {memberships[1].user.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {memberships[1].points.toLocaleString()} pts
                </p>
                {getRoleBadge(memberships[1].role)}
              </div>

              {/* First place */}
              <div className="flex flex-col items-center p-4 bg-gradient-to-b from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-sm font-bold mb-2">
                  <Crown size={18} />
                </div>
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden mb-2 ring-2 ring-yellow-300">
                  {memberships[0].user.image ? (
                    <img
                      src={memberships[0].user.image}
                      alt={memberships[0].user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={24} className="text-yellow-500" />
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate w-full text-center">
                  {memberships[0].user.name}
                </p>
                <p className="text-xs text-yellow-700 font-medium mt-0.5">
                  {memberships[0].points.toLocaleString()} pts
                </p>
                {getRoleBadge(memberships[0].role)}
              </div>

              {/* Third place */}
              <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 mt-4">
                <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center text-orange-800 text-sm font-bold mb-2">
                  3
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden mb-2">
                  {memberships[2].user.image ? (
                    <img
                      src={memberships[2].user.image}
                      alt={memberships[2].user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} className="text-orange-400" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate w-full text-center">
                  {memberships[2].user.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {memberships[2].points.toLocaleString()} pts
                </p>
                {getRoleBadge(memberships[2].role)}
              </div>
            </div>
          )}

          {/* Full ranked list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                All Members
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {memberships.map((member, index) => {
                const rank = index + 1;
                const style = getRankStyle(rank);
                const isCurrentUser = member.user.id === userId;

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 px-4 py-3 ${style.bg} ${
                      isCurrentUser ? "ring-1 ring-inset ring-blue-200" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {style.icon ? (
                        style.icon
                      ) : (
                        <span className="text-sm font-semibold text-gray-400">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-500">
                          {member.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Name and role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrentUser ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {member.user.name}
                          {isCurrentUser && (
                            <span className="text-xs font-normal text-blue-500 ml-1">
                              (You)
                            </span>
                          )}
                        </p>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${style.text}`}
                      >
                        {member.points.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
