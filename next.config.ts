/**
 * Next.js Configuration
 * 
 * This file defines the custom configuration for the Next.js application,
 * including experimental features, image handling, and server-side limits.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increases the body size limit for server actions (e.g., for large blog post content/images)
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Allows loading images from external domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google user profile pictures
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP images
      },
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://k-blog-backend.onrender.com'
        : 'http://localhost:5000');

    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
