"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Globe, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    if (!description.trim()) {
      setError("Group description is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          privacy,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create group. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const group = await res.json();
      router.push(`/groups/${group.id}/community`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Create a New Group
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Set up your community and start bringing people together.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Group Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React Developers Community"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">
                {name.length}/100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what this group is about..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="privacy"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Privacy
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrivacy("public")}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition text-left ${
                    privacy === "public"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      privacy === "public"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Public</p>
                    <p className="text-xs text-gray-500">
                      Anyone can find and join
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy("private")}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition text-left ${
                    privacy === "private"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      privacy === "private"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Private</p>
                    <p className="text-xs text-gray-500">
                      Invite only, hidden from search
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Group...
                  </>
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
