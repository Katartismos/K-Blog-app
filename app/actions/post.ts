"use server";

import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { eq, and, ne, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema/posts";
import { CATEGORY_COLORS } from "@/lib/constants";
import { generateUploadSignature } from "@/lib/cloudinary-server";
import { createSafeAction } from "@/lib/actions/action-wrapper";

/**
 * HTML Sanitization Options
 * Prevents XSS attacks by stripping disallowed tags and attributes.
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

/**
 * Generates an SEO-safe unique slug for posts.
 */
async function generateUniqueSlug(
  title: string,
  customSlug?: string,
  excludePostId?: string,
): Promise<string> {
  const base = (customSlug || title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const baseSlug = base || "post";

  const conditions = [eq(posts.slug, baseSlug)];
  if (excludePostId) {
    conditions.push(ne(posts.id, excludePostId));
  }

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(...conditions))
    .limit(1);

  if (!existing) {
    return baseSlug;
  }

  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${uniqueSuffix}`;
}

/**
 * 1. Cloudinary Upload Signature Action
 * Protected by Better Auth session and Arcjet defense.
 */
const getSignatureSchema = z
  .preprocess((val) => val ?? {}, z.object({
    folder: z.string().optional(),
  }))
  .optional()
  .default({});

export const getCloudinaryUploadSignature = createSafeAction(
  getSignatureSchema,
  async (input) => {
    const folder = input?.folder || "blog-posts";
    return generateUploadSignature(folder);
  },
  { requireAuth: true },
);

/**
 * 2. Create Post Action
 * Supports both FormData and plain object payloads.
 */
const createPostSchema = z.preprocess(
  (val) => {
    if (val instanceof FormData) {
      return {
        title: val.get("title"),
        content: val.get("content"),
        excerpt: val.get("excerpt"),
        category: val.get("category"),
        imageUrl: val.get("imageUrl"),
        slug: val.get("slug"),
      };
    }
    return val;
  },
  z.object({
    title: z.string().min(1, "Title is a required field."),
    content: z.string().min(1, "Content is a required field."),
    excerpt: z.string().optional(),
    category: z.string().min(1, "Category is a required field."),
    imageUrl: z.string().min(1, "An image is required."),
    slug: z.string().optional(),
  }),
);

export const createPost = createSafeAction(
  createPostSchema,
  async (input, { user }) => {
    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(input.content, sanitizeOptions);
    const plainText = sanitizedContent.replace(/<[^>]+>/g, " ").trim();

    if (plainText.length < 30) {
      throw new Error("Content must be at least 30 characters long.");
    }

    // Derive excerpt
    const excerpt =
      input.excerpt && input.excerpt.trim()
        ? input.excerpt.trim()
        : plainText.length > 160
          ? `${plainText.substring(0, 157)}...`
          : plainText || input.title;

    // Derive category color
    const categoryUpper = input.category.toUpperCase();
    const categoryColor =
      CATEGORY_COLORS[categoryUpper] ||
      CATEGORY_COLORS[input.category] ||
      "bg-gray-600";

    // Derive read time
    const words = plainText.split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))}-min read`;

    // Generate unique slug
    const slug = await generateUniqueSlug(input.title, input.slug);

    // Insert post into database
    const [newPost] = await db
      .insert(posts)
      .values({
        title: input.title,
        slug,
        content: sanitizedContent,
        excerpt,
        category: categoryUpper,
        categoryColor,
        imageUrl: input.imageUrl,
        readTime,
        userId: user.id,
      })
      .returning();

    // Revalidate paths for instant UI updates
    revalidatePath("/");
    revalidatePath("/others");

    return newPost;
  },
  { requireAuth: true },
);

/**
 * 3. Update Post Action
 * Requires author ownership or admin role.
 */
const updatePostSchema = z.object({
  idOrSlug: z.string().min(1, "Post ID or slug is required."),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  slug: z.string().optional(),
});

export const updatePost = createSafeAction(
  updatePostSchema,
  async (input, { user }) => {
    // 1. Find existing post
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(or(eq(posts.id, input.idOrSlug), eq(posts.slug, input.idOrSlug)))
      .limit(1);

    if (!existingPost) {
      throw new Error(`Post not found with identifier "${input.idOrSlug}"`);
    }

    // 2. Ownership verification
    const isAuthor = existingPost.userId === user.id;
    const isAdmin = (user as any).role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new Error("You are not authorized to update this post.");
    }

    // 3. Handle slug update
    let slug = existingPost.slug;
    if (
      (input.title && input.title !== existingPost.title) ||
      (input.slug && input.slug !== existingPost.slug)
    ) {
      slug = await generateUniqueSlug(
        input.title || existingPost.title,
        input.slug,
        existingPost.id,
      );
    }

    // 4. Handle category & categoryColor
    const category = input.category
      ? input.category.toUpperCase()
      : existingPost.category;
    const categoryColor = input.category
      ? CATEGORY_COLORS[category] || "bg-gray-600"
      : existingPost.categoryColor;

    // 5. Handle content, excerpt, and readTime
    let content = existingPost.content;
    let excerpt = existingPost.excerpt;
    let readTime = existingPost.readTime;

    if (input.content) {
      content = sanitizeHtml(input.content, sanitizeOptions);
      const plainText = content.replace(/<[^>]+>/g, " ").trim();

      if (plainText.length < 30) {
        throw new Error("Content must be at least 30 characters long.");
      }

      const words = plainText.split(/\s+/).filter(Boolean).length;
      readTime = `${Math.max(1, Math.ceil(words / 200))}-min read`;

      if (!input.excerpt) {
        excerpt =
          plainText.length > 160
            ? `${plainText.substring(0, 157)}...`
            : plainText || input.title || existingPost.title;
      }
    }

    if (input.excerpt) {
      excerpt = input.excerpt.trim();
    }

    // 6. Update database record
    const [updatedPost] = await db
      .update(posts)
      .set({
        title: input.title ?? existingPost.title,
        slug,
        content,
        excerpt,
        category,
        categoryColor,
        imageUrl: input.imageUrl ?? existingPost.imageUrl,
        readTime,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, existingPost.id))
      .returning();

    // 7. Revalidate caches
    revalidatePath("/");
    revalidatePath("/others");
    revalidatePath(`/blog/${existingPost.slug}`);
    if (slug !== existingPost.slug) {
      revalidatePath(`/blog/${slug}`);
    }

    return updatedPost;
  },
  { requireAuth: true },
);

/**
 * 4. Delete Post Action
 * Requires author ownership or admin role.
 */
const deletePostSchema = z.object({
  idOrSlug: z.string().min(1, "Post ID or slug is required."),
});

export const deletePost = createSafeAction(
  deletePostSchema,
  async (input, { user }) => {
    // 1. Find existing post
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(or(eq(posts.id, input.idOrSlug), eq(posts.slug, input.idOrSlug)))
      .limit(1);

    if (!existingPost) {
      throw new Error(`Post not found with identifier "${input.idOrSlug}"`);
    }

    // 2. Ownership verification
    const isAuthor = existingPost.userId === user.id;
    const isAdmin = (user as any).role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new Error("You are not authorized to delete this post.");
    }

    // 3. Delete record
    await db.delete(posts).where(eq(posts.id, existingPost.id));

    // 4. Revalidate paths
    revalidatePath("/");
    revalidatePath("/others");
    revalidatePath(`/blog/${existingPost.slug}`);

    return {
      message: "Post deleted successfully",
      id: existingPost.id,
      slug: existingPost.slug,
    };
  },
  { requireAuth: true },
);
