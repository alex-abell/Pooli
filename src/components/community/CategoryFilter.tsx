"use client";

import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: string | null;
  groupId: string;
}

export default function CategoryFilter({
  categories,
  activeCategoryId,
  groupId,
}: CategoryFilterProps) {
  const router = useRouter();

  function handleCategoryClick(categoryId: string | null) {
    if (categoryId) {
      router.push(`/groups/${groupId}/community?category=${categoryId}`);
    } else {
      router.push(`/groups/${groupId}/community`);
    }
  }

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
          !activeCategoryId
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
            activeCategoryId === category.id
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>{category.emoji}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}
