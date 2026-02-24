"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  Calendar,
  Wallet,
  Users,
} from "lucide-react";

interface PoolMobileNavProps {
  poolId: string;
}

const tabs = [
  { name: "Home", icon: LayoutDashboard, path: "" },
  { name: "Proposals", icon: Lightbulb, path: "proposals" },
  { name: "Moves", icon: Calendar, path: "moves" },
  { name: "Stash", icon: Wallet, path: "stash" },
  { name: "Members", icon: Users, path: "members" },
];

export default function PoolMobileNav({ poolId }: PoolMobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden border-b border-gray-200 bg-white overflow-x-auto">
      <div className="flex px-4">
        {tabs.map((tab) => {
          const href = tab.path
            ? `/pools/${poolId}/${tab.path}`
            : `/pools/${poolId}`;
          const isActive = tab.path
            ? pathname === href
            : pathname === `/pools/${poolId}`;
          return (
            <Link
              key={tab.name}
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
