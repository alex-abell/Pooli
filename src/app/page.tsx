import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Users, ArrowRight, Wallet, Lightbulb, Calendar } from "lucide-react";

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
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                Pool your money.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Plan together.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                A shared treasury for your friend group. Everyone contributes,
                anyone can propose, the group decides. Transparent spending,
                democratic decisions, more adventures.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  Get Started
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

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Pools works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to fund your group&apos;s next adventure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-5">
                <Wallet size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Contribute to the Stash
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Everyone chips in monthly. Every dollar is tracked transparently.
                See exactly where the money goes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-5">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Propose and Vote
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Any member can propose how to spend the fund. The group votes.
                No one person decides — the Pool does.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white mb-5">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Make Moves
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Approved proposals become Moves — real activities funded by the Pool.
                Opt in, show up, and make it happen.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop talking about it. Fund it.
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Create a Pool with your crew and start making plans real.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 transition"
            >
              Create Your Pool
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Pools. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  // Logged-in user: show "Your Pools"
  const userId = (session.user as { id: string }).id;

  const userPools = await prisma.pool.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
      host: {
        select: { name: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Pools</h2>
            <Link
              href="/pools/create"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
            >
              Create New
              <ArrowRight size={14} />
            </Link>
          </div>

          {userPools.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No pools yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first Pool and invite your crew to start contributing.
              </p>
              <Link
                href="/pools/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create a Pool
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userPools.map((pool) => (
                <Link
                  key={pool.id}
                  href={`/pools/${pool.id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition"
                >
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {pool.image && (
                      <img
                        src={pool.image}
                        alt={pool.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {pool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {pool.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Users size={14} />
                        <span>
                          {pool._count.members}{" "}
                          {pool._count.members === 1 ? "member" : "members"}
                        </span>
                      </div>
                      {pool.contributionAmount > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          ${pool.contributionAmount}/mo
                        </span>
                      )}
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
