import { type Config } from "drizzle-kit";

import { env } from "~/env";
import { PG_TABLE_PREFIX } from "~/server";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: [`${PG_TABLE_PREFIX}*`],
} satisfies Config;
