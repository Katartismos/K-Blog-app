/**
 * Welcome & Onboarding Page (Server Component)
 *
 * Route: /welcome
 * Presents the welcome screen, hero pitch, and authentication card.
 * If the user is already authenticated, redirects them straight to the main feed at '/'.
 */

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import WelcomeClient from "@/components/WelcomeClient";
import { BACKEND_URL, CATEGORY_COLORS, type Article } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to K-Blog — Discover Ideas & Stories",
  description:
    "Join readers and thought leaders on K-Blog. Sign in, create an account, or continue as guest to explore curated articles.",
};

export default async function WelcomePage() {
  // Check if user already has an active session
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  // Fetch posts from backend to optionally show the latest post on the preview card
  let previewArticle: Article | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/posts`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = await res.json();
      if (Array.isArray(posts) && posts.length > 0) {
        const firstPost = posts[0];
        previewArticle = {
          _id: firstPost.id ? String(firstPost.id) : String(firstPost._id || ""),
          id: firstPost.id ? String(firstPost.id) : "",
          slug: firstPost.slug || "",
          title: firstPost.title || "Health is Wealth",
          imageUrl:
            firstPost.imageUrl ||
            "https://placehold.co/800x600/374151/ffffff?text=No+Image",
          category: firstPost.category || "LIFESTYLE",
          categoryColor:
            firstPost.categoryColor ||
            CATEGORY_COLORS[firstPost.category] ||
            "bg-lime-600",
          date:
            firstPost.date ||
            (firstPost.createdAt
              ? new Date(firstPost.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "2 min read"),
          readTime: firstPost.readTime || "2 min read",
          excerpt:
            firstPost.excerpt ||
            "A brief explanation of why health can never be traded for anything.",
          author: firstPost.author?.name || firstPost.author || "Admin User",
          authorImage: firstPost.author?.image || null,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching preview post for welcome page:", error);
  }

  return <WelcomeClient previewArticle={previewArticle} />;
}
