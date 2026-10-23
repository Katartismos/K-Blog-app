"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client
 *
 * Native first-party client communicating directly with the Next.js App Router `/api/auth` endpoints.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
