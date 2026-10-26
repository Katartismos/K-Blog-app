# ADR-0001: Migrate Decoupled NestJS Backend to Unified Fullstack Next.js Application

## Status
Accepted

## Date
2026-10-22

## Context
K-Blog previously operated as a decoupled architecture:
- `backend/`: NestJS application hosted on Vercel Serverless Functions with `@nestjs/platform-express`, Multer, and `@arcjet/nest`.
- `frontend/`: Next.js App Router application proxying auth via rewrites and querying NestJS via HTTP `fetch()`.

This architecture suffered from critical issues in a serverless environment:
1. **Cold-start cascade**: Requests to the frontend triggered secondary cold starts on the NestJS backend, occasionally leading to `504 Gateway Timeout` and `FUNCTION_INVOCATION_TIMEOUT`.
2. **Network loopback overhead**: Server Components fetched their own backend over external HTTP instead of directly accessing the database.
3. **Payload restrictions**: Streaming raw multipart file uploads through Vercel serverless functions risked hitting the 4.5MB request body ceiling.
4. **Connection pooling penalties**: NestJS maintained a stateful WebSocket `Pool` across serverless invocations instead of using stateless HTTP querying.

## Decisions

### 1. Unified Fullstack Architecture
Consolidate the application into `frontend/` as the single source of truth deployed to Vercel. Deprecate and eventually remove `backend/`.

### 2. Stateless Database Layer (Neon HTTP + Drizzle)
- Move Drizzle schemas and migrations to `frontend/lib/db/`.
- Switch database connection from WebSocket `Pool` to stateless `@neondatabase/serverless` `neon()` + `drizzle-orm/neon-http`.
- Configure migration scripts (`db:generate`, `db:migrate`, `db:studio`) in `frontend/package.json`.

### 3. Native App Router Better Auth
- Eliminate Next.js `rewrites()` and external `BACKEND_URL`.
- Implement native Next.js route handler at `frontend/app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth.handler)`.
- Replace HTTP fetch in `frontend/auth.ts` with direct in-process `auth.api.getSession({ headers: await headers() })`.
- Update `frontend/lib/auth-client.ts` to use first-party `/api/auth` endpoints.

### 4. Data Access Layer (DAL) for Server Components
- Read operations (`getPosts`, `getPostBySlug`, `getCategoryCounts`) will be implemented as plain TypeScript functions in `frontend/lib/dal/posts.ts` executing Drizzle queries.
- Wrap read functions with `React.cache()` to deduplicate identical queries within a single render pass without duplicate database roundtrips.

### 5. In-House Typed Action Wrapper for Mutations
- Implement an in-house higher-order wrapper `createSafeAction` in `frontend/lib/actions/action-wrapper.ts`.
- Secure mutations with:
  - **Zod input validation**
  - **Better Auth session verification** (injects `ctx.user` and `ctx.session`)
  - **Arcjet protection** using `@arcjet/next` (`shield`, `detectBot`, `slidingWindow: 10 req / 30s`), keyed by `user.id` or client IP.
- Return structured `{ success: true, data } | { success: false, error }` results to prevent unexpected React error boundary crashes.

### 6. Cloudinary Direct Uploads
- Completely remove server-side Multer buffer processing.
- Generate signed upload parameters via an authenticated Server Action `getCloudinaryUploadSignature`.
- Browser uploads directly to Cloudinary CDN; mutations accept the verified Cloudinary URL.

## Consequences

### Positive
- Zero external loopback HTTP latency; pages render with direct DB queries.
- Drastically reduced cold-start latency by shedding NestJS runtime overhead.
- Immune to Vercel's 4.5MB body limit via direct Cloudinary uploads.
- Unified types, schema, migrations, and code within a single Next.js project.

### Negative / Trade-offs
- NestJS decorators (`@UseGuards`) are replaced with explicit functional composition in the Action Wrapper.
