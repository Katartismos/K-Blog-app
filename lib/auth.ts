import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins/bearer";
import { db } from "./db/client";
import * as schema from "./db/schema";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://k-blog-app.vercel.app"
    : "http://localhost:3000");

const trustedOrigins = Array.from(
  new Set([
    "http://localhost:3000",
    "https://k-blog-app.vercel.app",
    baseURL.replace(/\/$/, ""),
    ...(process.env.BETTER_AUTH_URL
      ? [process.env.BETTER_AUTH_URL.replace(/\/$/, "")]
      : []),
  ]),
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  plugins: [bearer()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
