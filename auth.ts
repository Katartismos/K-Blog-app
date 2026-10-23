/**
 * Server Authentication Helper
 * 
 * Provides native server-side session retrieval for Next.js Server Components
 * and Server Actions directly via Better Auth in-process API.
 */

import { headers } from "next/headers";
import { auth as betterAuth } from "@/lib/auth";

export async function auth() {
  try {
    const session = await betterAuth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error retrieving server session:", error);
    return null;
  }
}
