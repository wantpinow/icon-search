"use server";

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, cosineDistance, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { ActionError, authenticatedAction } from "~/server/actions";
import { suggestIconsSchema } from "./suggest-schema";
import {
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";

export const suggestIconsAction = authenticatedAction
  .schema(suggestIconsSchema)
  .action(async ({ parsedInput: { query, type, version, limit } }) => {
    // get the version number
    let versionNumber;
    if (version) {
      // get the version number from the version string
      const versionNumberRes = await db.query.packageVersionTable.findFirst({
        where: and(
          eq(packageVersionTable.type, type),
          eq(packageVersionTable.version, version),
        ),
        orderBy: desc(packageVersionTable.versionNumber),
      });
      if (!versionNumberRes) {
        throw new ActionError(`Version ${version} not found for type ${type}`);
      }
      versionNumber = versionNumberRes.versionNumber;
    } else {
      // get the latest version number
      const versionNumberRes = await db.query.packageVersionTable.findFirst({
        where: eq(packageVersionTable.type, type),
        orderBy: desc(packageVersionTable.versionNumber),
      });
      if (!versionNumberRes) {
        throw new ActionError(`No versions found for type ${type}`);
      }
      versionNumber = versionNumberRes.versionNumber;
    }

    // get the embedding for the query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // get the similarity between the query and the icons
    const similarity = sql<number>`1 - (${cosineDistance(iconTable.embedding, embedding)})`;
    const res = await db
      .select({
        name: iconTable.name,
      })
      .from(iconVersionTable)
      .where(
        and(
          eq(iconVersionTable.type, type),
          lte(iconVersionTable.rangeStart, versionNumber),
          gte(iconVersionTable.rangeEnd, versionNumber),
        ),
      )
      .innerJoin(iconTable, eq(iconTable.id, iconVersionTable.iconId))
      .orderBy(desc(similarity))
      .limit(limit);

    return res;
  });
