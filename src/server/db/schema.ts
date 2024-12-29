import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

import { PG_TABLE_PREFIX } from "~/server";
import { ICON_TYPES } from "~/types/icons";

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

// Icons
export const iconTypeEnum = pgEnum("icon_type", ICON_TYPES);
export const iconTable = createTable(
  "icon",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: iconTypeEnum("type").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => {
    return {
      typeIndex: index("icon_type_index").on(table.type),
      embeddingIndex: index("vocabEmbeddingIndex").using(
        "hnsw",
        table.embedding.op("vector_cosine_ops"),
      ),
    };
  },
);

export const iconTableRelations = relations(iconTable, ({ many }) => ({
  versions: many(iconVersionTable),
}));

export const packageVersionTable = createTable(
  "package_version",
  {
    type: iconTypeEnum("type").notNull(),
    version: text("version").notNull(),
    versionNumber: integer("version_number").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.type, table.version] }),
    };
  },
);

export const iconVersionTable = createTable(
  "icon_version",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: iconTypeEnum("type").notNull(),
    iconId: uuid("icon_id").notNull(),
    rangeStart: integer("range_start").notNull(),
    rangeEnd: integer("range_end").notNull(),
  },
  (table) => {
    return {
      iconReference: foreignKey({
        columns: [table.iconId],
        foreignColumns: [iconTable.id],
        name: "icon_version_icon_fkey",
      }),
    };
  },
);

export const iconVersionTableRelations = relations(
  iconVersionTable,
  ({ one }) => ({
    icon: one(iconTable, {
      fields: [iconVersionTable.iconId],
      references: [iconTable.id],
    }),
  }),
);

export const iconSuggestionRequestsTable = createTable(
  "icon_suggestion_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datetime: timestamp("datetime", {
      withTimezone: true,
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    ipAddress: text("ip_address"),
    apiKeyId: uuid("api_key_id"),
    query: text("query").notNull(),
    mode: text("mode").notNull(),
    type: iconTypeEnum("type").notNull(),
    versionNumber: integer("version_number").notNull(),
    limit: integer("limit").notNull(),
    result: jsonb("results").notNull(),
  },
  (table) => {
    return {
      // create an index on the datetime column
      datetimeIndex: index("datetime_index").on(table.datetime),
      // create an index on the ipAddress column
      ipAddressIndex: index("ip_address_index").on(table.ipAddress),
      apiKeyReference: foreignKey({
        columns: [table.apiKeyId],
        foreignColumns: [apiKeyTable.id],
        name: "icon_suggestion_requests_api_key_fkey",
      }),
    };
  },
);

export const iconSuggestionRequestsTableRelations = relations(
  iconSuggestionRequestsTable,
  ({ one }) => ({
    apiKey: one(apiKeyTable, {
      fields: [iconSuggestionRequestsTable.apiKeyId],
      references: [apiKeyTable.id],
    }),
  }),
);

export const apiKeyTable = createTable(
  "api_key",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(),
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
    revoked: boolean("revoked").notNull().default(false),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [userTable.id],
        name: "api_key_user_fkey",
      }),
    };
  },
);

export const apiKeyTableRelations = relations(apiKeyTable, ({ many }) => ({
  iconSuggestionRequests: many(iconSuggestionRequestsTable),
}));

// Types
export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
