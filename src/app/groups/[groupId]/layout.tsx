import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import GroupSidebar from "@/components/layout/GroupSidebar";
import GroupMobileNav from "@/components/layout/GroupMobileNav";
import JoinGroupBar from "@/components/community/JoinGroupBar";

interface GroupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}

export default async function GroupLayout({
  children,
  params,
}: GroupLayoutProps) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      _count: {
        select: { memberships: true },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let isMember = false;
  if (userId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
      select: { id: true },
    });
    isMember = !!membership;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <GroupSidebar
          groupId={group.id}
          groupName={group.name}
          groupImage={group.image}
          memberCount={group._count.memberships}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <GroupMobileNav groupId={group.id} />

          {!isMember && (
            <JoinGroupBar groupId={group.id} groupName={group.name} />
          )}

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
