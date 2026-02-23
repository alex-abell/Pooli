import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Users, Trophy, MessageSquare } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: {
          group: {
            include: {
              _count: { select: { memberships: true } },
            },
          },
        },
      },
      _count: {
        select: {
          posts: true,
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              {user.bio && (
                <p className="text-gray-700 mt-2">{user.bio}</p>
              )}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Trophy size={16} className="text-yellow-500" />
                  {user.points} total points
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MessageSquare size={16} />
                  {user._count.posts} posts
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users size={16} />
                  {user.memberships.length} groups
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.memberships.map((membership) => (
            <Link
              key={membership.id}
              href={`/groups/${membership.group.id}/community`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {membership.group.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {membership.group.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {membership.group._count.memberships} members
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 capitalize">
                  {membership.role}
                </span>
                <span className="text-yellow-600 font-medium">
                  {membership.points} pts
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
