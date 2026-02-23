"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface CreatePostModalProps {
  groupId: string;
  categories: Category[];
}

export default function CreatePostModal({
  groupId,
  categories,
}: CreatePostModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setIsOpen(true);
    setTitle("");
    setContent("");
    setCategoryId("");
    setError("");
  }

  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          groupId,
          categoryId: categoryId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create post.");
        setIsSubmitting(false);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        <Plus size={16} />
        Create Post
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Create Post
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="post-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  maxLength={200}
                />
              </div>

              <div>
                <label
                  htmlFor="post-content"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Content
                </label>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, ideas, or questions..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="post-category"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="post-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
