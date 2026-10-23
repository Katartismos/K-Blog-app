/**
 * Home Page (Server Component)
 * 
 * Fetches blog posts directly from the PostgreSQL Data Access Layer (DAL)
 * and displays featured articles, latest articles, and category topics.
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import HomeClient from "@/components/HomeClient";
import { getPosts, getCategoryCounts, serializePost } from "@/lib/dal/posts";

export const dynamic = "force-dynamic";

export default async function Page() {
  /**
   * Unauthenticated Entry Guard:
   * If user is neither authenticated nor in guest mode, redirect to /welcome
   */
  const cookieStore = await cookies();
  const isGuest = cookieStore.get("guest_mode")?.value === "true";
  const session = await auth();

  if (!session?.user && !isGuest) {
    redirect("/welcome");
  }

  /**
   * Direct DAL queries parallelized via Promise.all
   * getPosts() is cached per-request by React.cache()
   */
  const [rawPosts, topicsInfo] = await Promise.all([
    getPosts(),
    getCategoryCounts(),
  ]);

  const serializedPosts = rawPosts.map(serializePost);

  // Split posts into logical sections for UI
  const featuredArticles = serializedPosts.slice(0, 3); // Top 3 posts
  const latestArticles = serializedPosts.slice(3, 9);   // Next 6 posts
  const hasMore = serializedPosts.length > 9;

  return (
    <HomeClient
      featuredArticles={featuredArticles}
      latestArticles={latestArticles}
      hasMore={hasMore}
      topics={topicsInfo}
    />
  );
}