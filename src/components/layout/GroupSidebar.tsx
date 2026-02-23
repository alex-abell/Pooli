"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  GraduationCap,
  Calendar,
  Trophy,
  Users,
} from "lucide-react";

interface GroupSidebarProps {
  groupId: string;
  groupName: string;
  groupImage?: string | null;
  memberCount: number;
}

const tabs = [
  { name: "Community", icon: MessageSquare, path: "community" },
  { name: "Classroom", icon: GraduationCap, path: "classroom" },
  { name: "Calendar", icon: Calendar, path: "calendar" },
  { name: "Leaderboard", icon: Trophy, path: "leaderboard" },
  { name: "Members", icon: Users, path: "members" },
];

export default function GroupSidebar({
  groupId,
  groupName,
  groupImage,
  memberCount,
}: GroupSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] hidden lg:block">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {groupImage ? (
              <img
                src={groupImage}
                alt={groupName}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              groupName[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{groupName}</h2>
            <p className="text-xs text-gray-500">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const href = `/groups/${groupId}/${tab.path}`;
            const isActive = pathname === href;
            return (
              <Link
                key={tab.path}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
