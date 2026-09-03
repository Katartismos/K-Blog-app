'use client';

import { createAuthClient } from 'better-auth/react';
import { BACKEND_URL } from './constants';

/**
 * Better Auth Client
 * 
 * Proxies auth requests through Next.js rewrites to the NestJS backend.
 * This keeps session and OAuth state cookies first-party on the frontend domain.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
