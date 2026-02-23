import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import CategoryFilter from "@/components/community/CategoryFilter";
import { MessageSquare } from "lucide-react";

interface CommunityPageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function CommunityPage({
  params,
  searchParams,
}: CommunityPageProps) {
  const { groupId } = await params;
  const { category } = await searchParams;
  const activeCategoryId = category || null;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const categories = await prisma.category.findMany({
    where: { groupId },
    orderBy: { name: "asc" },
  });

  let isMember = false;
  if (userId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
      select: { id: true },
    });
    isMember = !!membership;
  }

  const whereClause: Record<string, unknown> = { groupId };
  if (activeCategoryId) {
    whereClause.categoryId = activeCategoryId;
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  const postsWithLikeStatus = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    isPinned: post.isPinned,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    category: post.category,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    isLiked: Array.isArray(post.likes) && post.likes.length > 0,
  }));

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        {isMember && (
          <CreatePostModal groupId={groupId} categories={categories} />
        )}
      </div>

      <CategoryFilter
        categories={categories}
        activeCategoryId={activeCategoryId}
        groupId={groupId}
      />

      {postsWithLikeStatus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No posts yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            {isMember
              ? "Be the first to share something with the community!"
              : "Join this group to start contributing to the conversation."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {postsWithLikeStatus.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              groupId={groupId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
