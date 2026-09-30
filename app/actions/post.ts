/**
 * Post Server Actions
 *
 * Contains functions that run on the server to handle blog post operations
 * via the NestJS PostgreSQL + Better Auth backend.
 */

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import sanitizeHtml from "sanitize-html";
import { BACKEND_URL } from "@/lib/constants";

/**
 * HTML Sanitization Options
 *
 * Defines which tags and attributes are allowed in the blog post content.
 * Prevents XSS attacks by stripping malicious scripts and styles.
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
 * Server Action to obtain an authenticated Cloudinary upload signature
 * from the NestJS backend for direct client-side upload.
 */
export async function getCloudinaryUploadSignature() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(`${BACKEND_URL}/posts/cloudinary-signature`, {
      method: "GET",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      return {
        error: `Failed to authenticate upload signature (${res.status}): ${errorText || res.statusText}`,
      };
    }

    const data = await res.json();
    return { data };
  } catch (err: unknown) {
    console.error("Signature fetch error:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while requesting upload signature.",
    };
  }
}

/**
 * createPost
 *
 * Server Action to create a new blog post via the backend API.
 *
 * @param {FormData} formData - Form data containing title, content, excerpt, category, image or imageUrl
 * @returns {Promise<{error?: string, success?: boolean, post?: any}>} Result of the operation.
 */
export async function createPost(formData: FormData) {
  // 1. Get cookies to pass authentication to backend
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // 2. Validate basic fields
  const title = formData.get("title") as string;
  const rawContent = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const imageFile = formData.get("image") as File | null;

  if (!title || !rawContent) {
    return { error: "Title and content are required fields." };
  }

  // 3. Sanitize HTML content
  const content = sanitizeHtml(rawContent, sanitizeOptions);
  const plainText = content.replace(/<[^>]+>/g, "").trim();
  if (plainText.length < 30) {
    return { error: "Content must be at least 30 characters long." };
  }

  if (!excerpt) {
    return { error: "Excerpt is a required field." };
  }

  // Validate presence of an image source (direct Cloudinary URL or uploaded file buffer)
  if (!imageUrl && (!imageFile || imageFile.size === 0)) {
    return { error: "An image is required." };
  }

  // Update content in formData with sanitized version
  formData.set("content", content);

  // 4. Send request to backend
  try {
    const res = await fetch(`${BACKEND_URL}/posts`, {
      method: "POST",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      let message = "";

      // Try to parse JSON error returned by NestJS / Better Auth
      try {
        const errorJson = JSON.parse(errorText);
        if (Array.isArray(errorJson.message)) {
          message = errorJson.message.join(", ");
        } else if (errorJson.message) {
          message = errorJson.message;
        } else if (typeof errorJson.error === "string") {
          message = errorJson.error;
        }
      } catch {
        // Non-JSON response (e.g. Vercel edge/gateway error, HTML page, or plain text)
      }

      // If no JSON message was extracted, map by HTTP status code or gateway response
      if (!message) {
        if (
          res.status === 504 ||
          errorText.includes("FUNCTION_INVOCATION_TIMEOUT") ||
          errorText.includes("Gateway Timeout")
        ) {
          message =
            "The server timed out while processing your request (likely due to a cold start). Please try again.";
        } else if (res.status === 401) {
          message = "You must be logged in to create a post.";
        } else if (res.status === 403) {
          message = "Access forbidden. Please ensure your session is active.";
        } else if (res.status === 500) {
          message =
            "The backend server encountered an internal error. Please check server logs and try again.";
        } else if (
          errorText &&
          errorText.length < 200 &&
          !errorText.includes("<html")
        ) {
          message = errorText.trim();
        } else {
          message = `Failed to create post on server (HTTP ${res.status}: ${res.statusText || "Error"}).`;
        }
      }

      console.error(
        `Post creation failed [HTTP ${res.status}]:`,
        message,
        errorText,
      );
      return { error: message };
    }

    const post = await res.json();

    // 5. Revalidate cache
    revalidatePath("/");
    revalidatePath("/others");

    return { success: true, post };
  } catch (error) {
    console.error("Error creating post via backend:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend server.",
    };
  }
}
