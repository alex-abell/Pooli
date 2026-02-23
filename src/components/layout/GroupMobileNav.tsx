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

interface GroupMobileNavProps {
  groupId: string;
}

const tabs = [
  { name: "Community", icon: MessageSquare, path: "community" },
  { name: "Classroom", icon: GraduationCap, path: "classroom" },
  { name: "Calendar", icon: Calendar, path: "calendar" },
  { name: "Leaderboard", icon: Trophy, path: "leaderboard" },
  { name: "Members", icon: Users, path: "members" },
];

export default function GroupMobileNav({ groupId }: GroupMobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden border-b border-gray-200 bg-white overflow-x-auto">
      <div className="flex px-4">
        {tabs.map((tab) => {
          const href = `/groups/${groupId}/${tab.path}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.path}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
