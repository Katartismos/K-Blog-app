/**
 * Shared Constants and Types
 * 
 * This file contains global type definitions, constant configurations (like colors),
 * and backend endpoint configurations.
 */

/**
 * Backend API URL
 * Automatically handles development vs production backend URLs.
 */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://k-blog-backend.onrender.com'
    : 'http://localhost:5000');

/**
 * Author Object Interface
 */
export interface Author {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Article Interface
 * 
 * Represents a blog post object as returned by the PostgreSQL backend / Drizzle ORM.
 */
export interface Article { 
  _id?: string;
  id?: string;
  slug?: string;
  title: string;
  content?: string;
  excerpt: string;
  category: string;
  categoryColor?: string;
  author: string;
  authorImage?: string | null;
  date?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  readTime: string;
  imageUrl: string;
}

export interface ArticleProps {
  article: Article;
}

/**
 * Category Color Mapping
 * 
 * Maps uppercase category names to Tailwind CSS background color classes.
 * These are used dynamically throughout the app (Header, Cards, Sidebar).
 */
export const CATEGORY_COLORS: Record<string, string> = {
  TECHNOLOGY: 'bg-indigo-600',
  TRAVEL: 'bg-sky-500',
  FOODS: 'bg-orange-600',
  LIFESTYLE: 'bg-lime-600',
  FINANCE: 'bg-emerald-600',
  GAMING: 'bg-violet-600',
};

export const CATEGORIES_LIST = [
  'TECHNOLOGY',
  'TRAVEL',
  'FOODS',
  'LIFESTYLE',
  'FINANCE',
  'GAMING',
] as const;