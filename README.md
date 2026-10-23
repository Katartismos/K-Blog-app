# K-Blog 📰

K-Blog is a modern, high-performance, fullstack blog platform built with Next.js 16 (App Router + React 19). It features a sleek, responsive design, a powerful rich-text editor, direct browser-to-CDN Cloudinary uploads, native Better Auth authentication with Google OAuth & email/password, Arcjet bot defense & rate limiting, and direct stateless Neon PostgreSQL queries powered by Drizzle ORM.

## ✨ Features

- **Full-Stack Architecture**: Unified Next.js 16 App Router application with React Server Components (RSC) and Server Actions.
- **Stateless Database Layer**: Connects directly to Neon PostgreSQL over HTTP using `@neondatabase/serverless` and Drizzle ORM.
- **Cached Data Access Layer (DAL)**: High-speed server querying deduplicated per-request via `React.cache()`.
- **Native Authentication**: In-process Better Auth integration with Drizzle adapter, Google OAuth, email/password, and role-based permissions.
- **Runtime Security**: Active Arcjet WAF shield, automated bot detection, and sliding window rate limiting guarding mutations.
- **Direct Cloudinary Media Uploads**: Browser-to-CDN uploads via cryptographic server signatures, bypassing serverless body limits.
- **Dynamic Article Management**: Organize content across categories (Technology, Travel, Food, Lifestyle, Finance, Gaming) with auto-derived read times and SEO-safe unique slugs.
- **Rich Text Editing**: Integrated **Tiptap** editor with sanitized HTML persistence.
- **Tactile UI & Animations**: Powered by **GSAP** and **Tailwind CSS**.

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Database & ORM**: [Neon Lakebase Postgres](https://neon.com/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Security & Protection**: [Arcjet](https://arcjet.com/)
- **Media CDN**: [Cloudinary](https://cloudinary.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [Tiptap](https://tiptap.dev/)
- **Animations**: [GSAP](https://gsap.com/)

## 🛠️ Environment Variables

Create `.env.local` in `frontend/` with:
```env
# Database Connection (Neon Postgres)
DATABASE_URL="postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://<user>:<password>@<endpoint>.<region>.aws.neon.tech/neondb?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_min_32_chars

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Arcjet Security
ARCJET_ENV=development
ARCJET_KEY=ajkey_your_arcjet_key

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📜 Available Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds the production bundle with Turbopack.
- `pnpm start`: Starts the Next.js production server.
- `pnpm lint`: Runs ESLint checks.
- `pnpm db:generate`: Generates Drizzle migration files.
- `pnpm db:migrate`: Executes Drizzle migrations.
- `pnpm db:studio`: Opens Drizzle Studio database explorer.
