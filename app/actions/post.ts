/**
 * Post Server Actions
 * 
 * Contains functions that run on the server to handle blog post operations
 * via the NestJS PostgreSQL + Better Auth backend.
 */

'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import sanitizeHtml from 'sanitize-html';
import { BACKEND_URL } from '@/lib/constants';

/**
 * HTML Sanitization Options
 * 
 * Defines which tags and attributes are allowed in the blog post content.
 * Prevents XSS attacks by stripping malicious scripts and styles.
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'a',
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

/**
 * createPost
 * 
 * Server Action to create a new blog post via the backend API.
 * 
 * @param {FormData} formData - Form data containing title, content, excerpt, category, image
 * @returns {Promise<{error?: string, success?: boolean, post?: any}>} Result of the operation.
 */
export async function createPost(formData: FormData) {
  // 1. Get cookies to pass authentication to backend
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // 2. Validate basic fields
  const title = formData.get('title') as string;
  const rawContent = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const imageFile = formData.get('image') as File | null;

  if (!title || !rawContent) {
    return { error: 'Title and content are required fields.' };
  }

  // 3. Sanitize HTML content
  const content = sanitizeHtml(rawContent, sanitizeOptions);
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  if (plainText.length < 30) {
    return { error: 'Content must be at least 30 characters long.' };
  }

  if (!excerpt) {
    return { error: 'Excerpt is a required field.' };
  }

  if (!imageFile || imageFile.size === 0) {
    return { error: 'An image is required.' };
  }

  // Update content in formData with sanitized version
  formData.set('content', content);

  // 4. Send request to backend
  try {
    const res = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: formData,
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || (res.status === 401 ? 'You must be logged in to create a post.' : 'Failed to create post on server.');
      return { error: Array.isArray(message) ? message.join(', ') : message };
    }

    const post = await res.json();

    // 5. Revalidate cache
    revalidatePath('/');
    revalidatePath('/others');

    return { success: true, post };
  } catch (error) {
    console.error('Error creating post via backend:', error);
    return { error: error instanceof Error ? error.message : 'Unable to connect to the backend server.' };
  }
}
