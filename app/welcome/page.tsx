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
import { getPosts, serializePost } from "@/lib/dal/posts";

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

  // Fetch posts directly from DAL to optionally show the latest post on the preview card
  const posts = await getPosts();
  const previewArticle = posts.length > 0 ? serializePost(posts[0]) : null;

  return <WelcomeClient previewArticle={previewArticle} />;
}
