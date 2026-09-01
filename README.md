# K-Blog 📰

K-Blog is a modern, high-performance blog platform built with Next.js and NestJS. It features a sleek, responsive design, a powerful rich-text editor, Google OAuth authentication via Better Auth, and a PostgreSQL backend.

## ✨ Features

- **Dynamic Article Management**: Organize content across categories like Technology, Travel, Food, Lifestyle, Finance, and Gaming.
- **Rich Text Editing**: Integrated **Tiptap** editor for a smooth, feature-rich blogging experience.
- **Smooth UI Animations**: Powered by **GSAP** for fluid transitions and a premium tactile feel.
- **Full-Stack Power**: Built with **Next.js 16 (App Router)** frontend communicating with a **NestJS** PostgreSQL backend.
- **Secure Authentication**: Integrated **Better Auth** with Google OAuth and session management.
- **Scalable Database**: Uses **PostgreSQL** with **Drizzle ORM** for robust, performant data persistence.
- **Responsive Design**: Crafted with **Tailwind CSS** for a perfect look on any device.

## 🚀 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)
- **Backend**: [NestJS](https://nestjs.com/) + [Drizzle ORM](https://orm.drizzle.team/) + [PostgreSQL](https://www.postgresql.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Editor**: [Tiptap](https://tiptap.dev/)
- **Animations**: [GSAP](https://gsap.com/)

## 🛠️ Environment Setup

Create `.env.local` in `frontend/` with:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_better_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
