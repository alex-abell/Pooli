import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PoolSidebar from "@/components/layout/PoolSidebar";
import PoolMobileNav from "@/components/layout/PoolMobileNav";
import JoinPoolBar from "@/components/pool/JoinPoolBar";

interface PoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{ poolId: string }>;
}

export default async function PoolLayout({
  children,
  params,
}: PoolLayoutProps) {
  const { poolId } = await params;

  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  if (!pool) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let isMember = false;
  if (userId) {
    const member = await prisma.member.findUnique({
      where: {
        userId_poolId: { userId, poolId },
      },
      select: { id: true },
    });
    isMember = !!member;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <PoolSidebar
          poolId={pool.id}
          poolName={pool.name}
          poolImage={pool.image}
          memberCount={pool._count.members}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <PoolMobileNav poolId={pool.id} />

          {!isMember && (
            <JoinPoolBar poolId={pool.id} poolName={pool.name} contributionAmount={pool.contributionAmount} />
          )}

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
