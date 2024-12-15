import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import { env } from "~/env";

export const initializePg = () => {
  const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
  };
  const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
  if (env.NODE_ENV !== "production") globalForDb.conn = conn;
  const db = drizzlePostgres(conn, { schema });
  return { conn, db };
};

export const initializeNeon = () => {
  const conn = neon(env.DATABASE_URL);
  const db = drizzleNeon(conn, { schema });
  return { conn, db };
};

const isLocal = env.DATABASE_URL.includes("@localhost:");
export const { conn, db } = isLocal ? initializePg() : initializeNeon();
