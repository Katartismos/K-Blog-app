'use client';

import { createAuthClient } from 'better-auth/react';
import { BACKEND_URL } from './constants';

/**
 * Better Auth Client
 * 
 * Configured with the NestJS backend baseURL (http://localhost:5000 in dev, 
 * or https://k-blog-backend.onrender.com in prod).
 * Handles social sign-in, credentials, sessions, and cookies.
 */
export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
