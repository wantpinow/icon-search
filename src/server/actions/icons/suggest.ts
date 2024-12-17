"use server";

import { embed, generateObject, TypeValidationError } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, cosineDistance, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { ActionError, authenticatedAction } from "~/server/actions";
import { suggestIconsSchema } from "./schemas";
import {
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";

export const suggestIconsAction = authenticatedAction
  .schema(suggestIconsSchema)
  .action(
    async ({ parsedInput: { query, type, version, limit, advanced } }) => {
      // get the version number
      console.time("Getting version number");
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
          throw new ActionError(
            `Version ${version} not found for type ${type}`,
          );
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
      console.timeEnd("Getting version number");

      // get the embedding for the query
      console.time("Getting embedding");
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: `Suggest icons for the query "${query}"`,
      });
      console.timeEnd("Getting embedding");

      // get the similarity between the query and the icons
      console.time("Getting similarity");
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
        .limit(Math.max(limit, 50));
      console.timeEnd("Getting similarity");
      const iconNames = res.map((r) => r.name);

      if (!advanced) {
        return iconNames.slice(0, limit);
      }

      // rerank with gpt-4o
      console.time("Reranking");
      try {
        const { object } = await generateObject({
          model: openai("gpt-4o"),
          output: "enum",
          enum: iconNames,
          prompt: `Suggest a single icon for the query "${query}". Here are some tips to help you select the best icon:\n1. If the query is generic, suggest a generic icon.\n2. If the query is specific, suggest a specific icon.\n3. Don't recommend brand icons unless the query asks for one.\n4. Try not to suggest icons that are used for navigation or other non-content purposes, unless the query asks for one.`,
          temperature: 0,
        });
        console.timeEnd("Reranking");
        if (!iconNames.includes(object)) {
          throw new ActionError("No icon found for the query");
        }
        return [object, ...iconNames.filter((i) => i !== object)].slice(
          0,
          limit,
        );
      } catch (error) {
        console.timeEnd("Reranking");
        if (error instanceof TypeValidationError) {
          // @ts-expect-error - Value property is not typed in TypeValidationError but exists at runtime
          console.log(`Could not generate icon:${error.value.result}`);
          throw new ActionError("No icon found for the query");
        }
        throw error;
      }
      // check that object is in the enum
    },
  );
