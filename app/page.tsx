/**
 * Home Page (Server Component)
 * 
 * Fetches blog posts from the NestJS PostgreSQL backend and displays
 * featured articles, latest articles, and category topics.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import HomeClient from '@/components/HomeClient';
import { BACKEND_URL, CATEGORIES_LIST, CATEGORY_COLORS, type Article } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function Page() {
  /**
   * Unauthenticated Entry Guard:
   * If user is neither authenticated nor in guest mode, redirect to /welcome
   */
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest_mode')?.value === 'true';
  const session = await auth();

  if (!session?.user && !isGuest) {
    redirect('/welcome');
  }
  /**
   * Fetch posts from backend
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/posts`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      posts = await res.json();
    } else {
      console.error(`Failed to fetch posts from backend: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching posts from backend:', error);
  }

  /**
   * Data Serialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedPosts: Article[] = posts.map((post: any) => ({
    _id: post.id ? String(post.id) : String(post._id || ''),
    id: post.id ? String(post.id) : '',
    slug: post.slug || '',
    title: post.title || 'Untitled',
    imageUrl: post.imageUrl || 'https://placehold.co/800x600/374151/ffffff?text=No+Image',
    category: post.category || 'TECHNOLOGY',
    categoryColor: post.categoryColor || CATEGORY_COLORS[post.category] || 'bg-indigo-600',
    date: post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'),
    readTime: post.readTime || '5-min read',
    excerpt: post.excerpt || 'No excerpt available.',
    author: post.author?.name || post.author || 'Admin User',
    authorImage: post.author?.image || null,
  }));

  // Split posts into logical sections for the UI
  const featuredArticles = serializedPosts.slice(0, 3); // Top 3 posts
  const latestArticles = serializedPosts.slice(3, 9);   // Next 6 posts
  const hasMore = serializedPosts.length > 9;

  // Calculate category topics info from the posts list
  const topicsInfo = CATEGORIES_LIST.map(cat => {
    const count = serializedPosts.filter(p => (p.category || '').toUpperCase() === cat).length;
    return {
      name: cat.charAt(0) + cat.slice(1).toLowerCase(),
      count,
    };
  });

  // Render the Client Component with the prepared data
  return (
    <HomeClient 
      featuredArticles={featuredArticles} 
      latestArticles={latestArticles} 
      hasMore={hasMore} 
      topics={topicsInfo} 
    />
  );
}