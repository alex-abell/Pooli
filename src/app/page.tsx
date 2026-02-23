import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Users, ArrowRight, Globe, BookOpen, Trophy, Sparkles } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                The platform for community builders
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                Build your community.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Grow together.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Bring your members together with courses, discussions, events, and
                gamification. Pooli gives you everything you need to build a
                thriving online community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-50 transition border border-gray-200 flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to build community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All the tools to engage your members, deliver content, and grow your
              community in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-5">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community Discussions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create categories, start discussions, and keep your members
                engaged with a rich community feed. Like, comment, and pin
                important posts.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-5">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Courses & Classroom
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build structured courses with modules and lessons. Track member
                progress and deliver educational content to your community.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white mb-5">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gamification & Leaderboards
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Motivate your members with points, levels, and leaderboards.
                Reward engagement and celebrate your most active community members.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build your community?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of community builders who use Pooli to connect,
              educate, and grow.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 transition"
            >
              Start Building Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Pooli. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  // Logged-in user: show discover communities page
  const userId = (session.user as { id: string }).id;

  const userGroups = await prisma.group.findMany({
    where: {
      memberships: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      _count: {
        select: { memberships: true },
      },
      owner: {
        select: { name: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const publicGroups = await prisma.group.findMany({
    where: {
      privacy: "public",
      memberships: {
        none: {
          userId: userId,
        },
      },
    },
    include: {
      _count: {
        select: { memberships: true },
      },
      owner: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Your Groups Section */}
        {userGroups.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
              <Link
                href="/groups/create"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
              >
                Create New
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}/community`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition"
                >
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {group.image && (
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                      <Users size={14} />
                      <span>
                        {group._count.memberships}{" "}
                        {group._count.memberships === 1 ? "member" : "members"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Discover Communities Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Discover Communities
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Find and join public communities that interest you
              </p>
            </div>
          </div>

          {publicGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No communities to discover yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to create a community and start building something
                amazing.
              </p>
              <Link
                href="/groups/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create a Community
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {publicGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}/community`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {group.image && (
                      <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Users size={12} />
                      {group._count.memberships}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">
                        by {group.owner.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
