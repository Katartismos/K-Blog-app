import { cache } from "react";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema/posts";
import { CATEGORY_COLORS, CATEGORIES_LIST, type Article } from "@/lib/constants";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serializes raw database post and author relation into Article interface
 * expected by UI components.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializePost(post: any): Article {
  const authorName = post.author?.name || "Admin User";
  const authorImage = post.author?.image || null;
  const category = (post.category || "TECHNOLOGY").toUpperCase();
  const categoryColor =
    post.categoryColor || CATEGORY_COLORS[category] || "bg-indigo-600";
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  return {
    _id: String(post.id),
    id: String(post.id),
    slug: post.slug || "",
    title: post.title || "Untitled",
    content: post.content || "",
    excerpt: post.excerpt || "No excerpt available.",
    category,
    categoryColor,
    imageUrl:
      post.imageUrl ||
      "https://placehold.co/800x600/374151/ffffff?text=No+Image",
    readTime: post.readTime || "5-min read",
    author: authorName,
    authorImage,
    date,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

/**
 * Fetches all blog posts with author details, ordered from newest to oldest.
 * Wrapped in React.cache() for per-request deduplication across Server Components.
 */
export const getPosts = cache(async () => {
  try {
    const rawPosts = await db.query.posts.findMany({
      orderBy: (postsTable, { desc }) => [desc(postsTable.createdAt)],
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return rawPosts;
  } catch (error) {
    console.error("DAL Error in getPosts:", error);
    return [];
  }
});

/**
 * Retrieves a single post by slug or UUID with author relation.
 * Wrapped in React.cache() for per-request deduplication across Server Components.
 */
export const getPostBySlug = cache(async (slugOrId: string) => {
  try {
    const isUuid = UUID_REGEX.test(slugOrId);

    const post = await db.query.posts.findFirst({
      where: isUuid
        ? or(eq(posts.id, slugOrId), eq(posts.slug, slugOrId))
        : eq(posts.slug, slugOrId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return post || null;
  } catch (error) {
    console.error(`DAL Error in getPostBySlug for "${slugOrId}":`, error);
    return null;
  }
});

/**
 * Calculates category distribution count for topics sidebar.
 */
export const getCategoryCounts = cache(async () => {
  const allPosts = await getPosts();
  return CATEGORIES_LIST.map((cat) => {
    const count = allPosts.filter(
      (p) => (p.category || "").toUpperCase() === cat,
    ).length;
    return {
      name: cat.charAt(0) + cat.slice(1).toLowerCase(),
      count,
    };
  });
});
