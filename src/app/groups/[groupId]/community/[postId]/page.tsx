"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: string;
  name: string;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  category: { name: string; emoji: string } | null;
  likes: { userId: string }[];
  comments: Comment[];
  _count: { likes: number; comments: number };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/posts/${params.postId}`);
    if (res.ok) {
      const data = await res.json();
      setPost(data);
    }
    setLoading(false);
  }, [params.postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!session) return;
    await fetch(`/api/posts/${params.postId}/like`, { method: "POST" });
    fetchPost();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;
    setSubmitting(true);

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: params.postId, content: comment }),
    });

    setComment("");
    setSubmitting(false);
    fetchPost();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const res = await fetch(`/api/posts/${params.postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/groups/${params.groupId}/community`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-gray-500">Post not found</div>
    );
  }

  const isLiked = post.likes.some((l) => l.userId === session?.user?.id);
  const isAuthor = post.author.id === session?.user?.id;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Back to community
      </button>

      <article className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {post.author.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.category && (
              <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                {post.category.emoji} {post.category.name}
              </span>
            )}
            {isAuthor && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
          {post.content}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${
              isLiked
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            {post._count.likes}
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MessageCircle size={18} />
            {post.comments.length} comments
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({post.comments.length})
        </h2>

        {session && (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                {session.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!comment.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium shrink-0">
                {c.author.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {c.author.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(c.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            </div>
          ))}

          {post.comments.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
