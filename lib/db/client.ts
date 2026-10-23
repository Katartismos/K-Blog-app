import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "production") {
  console.warn("DATABASE_URL is not set. Database queries will fail if executed.");
}

const sql = neon(connectionString || "");

export const db = drizzle({ client: sql, schema });
export type Database = typeof db;
