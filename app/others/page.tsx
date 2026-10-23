/**
 * Others Page (Server Component)
 * 
 * Displays older blog posts fetched directly from the PostgreSQL Data Access Layer (DAL).
 */

import OthersClient from "@/components/OthersClient";
import { getPosts, getCategoryCounts, serializePost } from "@/lib/dal/posts";

export const dynamic = "force-dynamic";

export default async function OthersPage() {
  const [rawPosts, topicsInfo] = await Promise.all([
    getPosts(),
    getCategoryCounts(),
  ]);

  const serializedPosts = rawPosts.map(serializePost);

  // Older posts are those after the first 9 featured/latest posts
  const olderPosts = serializedPosts.slice(9);

  return <OthersClient olderPosts={olderPosts} topics={topicsInfo} />;
}
