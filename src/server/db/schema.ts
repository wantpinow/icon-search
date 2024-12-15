import { pgTableCreator } from "drizzle-orm/pg-core";
import { PG_TABLE_PREFIX } from "~/server";

export const createTable = pgTableCreator(
  (name) => `${PG_TABLE_PREFIX}${name}`,
);
