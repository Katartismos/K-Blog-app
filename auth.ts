/**
 * Server Authentication Helper
 * 
 * Provides server-side session retrieval for Next.js Server Components
 * and Server Actions by communicating with the NestJS Better Auth backend.
 */

import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/constants';

export async function auth() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    if (!cookieHeader) {
      return null;
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const session = await res.json();
    return session;
  } catch (error) {
    console.error('Error fetching server session from backend:', error);
    return null;
  }
}
