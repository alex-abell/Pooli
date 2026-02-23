"use client";

import { useState } from "react";
import { Heart, MessageCircle, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostDetail from "@/components/community/PostDetail";

interface PostAuthor {
  id: string;
  name: string;
  image: string | null;
}

interface PostCategory {
  id: string;
  name: string;
  emoji: string;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: PostAuthor;
  category: PostCategory | null;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: PostData;
  groupId: string;
}

export default function PostCard({ post, groupId }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedContent =
    post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();

    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
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

  return (
    <>
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition cursor-pointer"
      >
        {post.isPinned && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-3">
            <Pin size={12} />
            Pinned Post
          </div>
        )}

        <div className="flex items-start gap-3">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">
                {post.author.name}
              </span>
              <span className="text-xs text-gray-400">{timeAgo}</span>
              {post.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  <span>{post.category.emoji}</span>
                  {post.category.name}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-900 mt-1.5">
              {post.title}
            </h3>

            <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
              {truncatedContent}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition ${
                  liked
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  size={16}
                  className={liked ? "fill-current" : ""}
                />
                <span className="tabular-nums">{likeCount}</span>
              </button>

              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <MessageCircle size={16} />
                <span className="tabular-nums">{post.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <PostDetail
          postId={post.id}
          groupId={groupId}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
