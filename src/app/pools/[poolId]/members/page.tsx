import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import MembersSearch from "@/components/members/MembersSearch";

interface MembersPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { poolId } = await params;
  const session = await getServerSession(authOptions);

  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    select: { id: true, name: true },
  });

  if (!pool) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-500">Pool not found.</p>
      </div>
    );
  }

  const memberships = await prisma.member.findMany({
    where: { poolId },
    orderBy: { joinedAt: "asc" },
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

  const serializedMembers = memberships.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    image: m.user.image,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
  }));

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-500 text-sm">
              {memberships.length}{" "}
              {memberships.length === 1 ? "member" : "members"} in this pool
            </p>
          </div>
        </div>
      </div>

      <MembersSearch members={serializedMembers} />
    </div>
  );
}
