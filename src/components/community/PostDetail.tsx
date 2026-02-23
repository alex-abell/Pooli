"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  Pin,
} from "lucide-react";

interface Author {
  id: string;
  name: string;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  parentId: string | null;
  replies?: Comment[];
}

interface PostDetailData {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: Author;
  category: Category | null;
  comments: Comment[];
  likes: { id: string }[];
  _count: {
    comments: number;
    likes: number;
  };
}

interface PostDetailProps {
  postId: string;
  groupId: string;
  onClose: () => void;
}

export default function PostDetail({
  postId,
  groupId,
  onClose,
}: PostDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [post, setPost] = useState<PostDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) {
        setError("Failed to load post.");
        setIsLoading(false);
        return;
      }

      const data: PostDetailData = await res.json();
      setPost(data);
      setLikeCount(data._count.likes);
      setLiked(
        Array.isArray(data.likes) && data.likes.length > 0
      );
      setIsLoading(false);
    } catch {
      setError("Failed to load post.");
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleLike() {
    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();

    if (!commentContent.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent.trim(),
          postId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post comment.");
        setIsSubmittingComment(false);
        return;
      }

      setCommentContent("");
      await fetchPost();
      router.refresh();
    } catch {
      setError("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {post?.title || "Loading..."}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : error && !post ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : post ? (
            <div>
              <div className="p-5">
                {post.isPinned && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-3">
                    <Pin size={12} />
                    Pinned Post
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {post.author.image ? (
                      <img
                        src={post.author.image}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      post.author.name[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {post.author.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {post.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <span>{post.category.emoji}</span>
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h2>

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm font-medium transition ${
                      liked
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={liked ? "fill-current" : ""}
                    />
                    <span className="tabular-nums">{likeCount}</span>
                    <span className="hidden sm:inline">
                      {likeCount === 1 ? "Like" : "Likes"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MessageCircle size={18} />
                    <span className="tabular-nums">
                      {post._count.comments}
                    </span>
                    <span className="hidden sm:inline">
                      {post._count.comments === 1 ? "Comment" : "Comments"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200">
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Comments ({post._count.comments})
                  </h3>

                  {post.comments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {post.comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {session && post && (
          <div className="border-t border-gray-200 p-4 shrink-0">
            {error && (
              <p className="text-xs text-red-600 mb-2">{error}</p>
            )}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!commentContent.trim() || isSubmittingComment}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {comment.author.image ? (
            <img
              src={comment.author.image}
              alt={comment.author.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            comment.author.name[0]?.toUpperCase() || "U"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-gray-900">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
