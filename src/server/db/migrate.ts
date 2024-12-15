import "dotenv/config";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { initializePg } from ".";

export const { conn, db } = initializePg();

await migrate(db, { migrationsFolder: "./drizzle" });

await conn.end();
