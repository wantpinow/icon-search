import { type InferSelectModel, sql } from "drizzle-orm";
import {
  foreignKey,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { PG_TABLE_PREFIX } from "~/server";

export const createTable = pgTableCreator(
  (name) => `${PG_TABLE_PREFIX}${name}`,
);

// Authentication
export const userTable = createTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  githubId: text("github_id").unique(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  username: varchar("username", { length: 256 }).unique().notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const sessionTable = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [userTable.id],
        name: "session_user_fkey",
      })
        .onDelete("cascade")
        .onUpdate("cascade"),
    };
  },
);

// Types
export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
