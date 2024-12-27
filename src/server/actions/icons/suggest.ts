"use server";

import { embed, generateObject, TypeValidationError } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, cosineDistance, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { ActionError, publicAction } from "~/server/actions";
import { suggestIconsSchema } from "./schemas";
import {
  iconSuggestionRequestsTable,
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";
import { z } from "zod";
import { headers } from "next/headers";

export async function getIPAddress() {
  return headers().get("x-forwarded-for");
}

// 10 requests per minute for unauthenticated requests
const UNAUTHENTICATED_REQUEST_TIME_FRAME = 60;
const UNAUTHENTICATED_REQUEST_LIMIT = 10;

export const suggestIconsAction = publicAction
  .schema(suggestIconsSchema)
  .action(async ({ parsedInput: { query, type, version, limit, mode } }) => {
    // get the ip address
    const ipAddress = await getIPAddress();
    if (!ipAddress) {
      throw new ActionError("Could not get IP address");
    }
    console.log(`IP Address: ${ipAddress}`);

    // check rate limit
    const [rateLimitRes] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(iconSuggestionRequestsTable)
      .where(
        and(
          eq(iconSuggestionRequestsTable.ipAddress, ipAddress),
          gte(
            iconSuggestionRequestsTable.datetime,
            sql`CURRENT_TIMESTAMP - INTERVAL '${sql.raw(UNAUTHENTICATED_REQUEST_TIME_FRAME.toString())} seconds'`,
          ),
        ),
      );
    if (
      rateLimitRes === undefined ||
      rateLimitRes.count >= UNAUTHENTICATED_REQUEST_LIMIT
    ) {
      throw new ActionError(
        `Rate limit exceeded, only allowed ${UNAUTHENTICATED_REQUEST_LIMIT} requests per ${UNAUTHENTICATED_REQUEST_TIME_FRAME} seconds`,
      );
    }

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

    let result: string[];

    if (mode === "semantic") {
      result = iconNames.slice(0, limit);
    } else {
      // rerank with gpt-4o
      console.time("Reranking");
      try {
        if (mode === "top-1") {
          result = await rerankTop1(query, iconNames, limit);
        } else if (mode === "top-k") {
          result = await rerankTopK(query, iconNames, limit);
        } else {
          throw new ActionError("Invalid reranking mode");
        }
        console.timeEnd("Reranking");
      } catch (error) {
        console.timeEnd("Reranking");
        if (error instanceof TypeValidationError) {
          // @ts-expect-error - Value property is not typed in TypeValidationError but exists at runtime
          console.log(`Could not generate icon:${error.value.result}`);
          throw new ActionError("No icon found for the query");
        }
        throw error;
      }
    }

    // insert the request into the database
    await db.insert(iconSuggestionRequestsTable).values({
      ipAddress,
      query,
      mode,
      type,
      versionNumber,
      limit,
      result,
    });

    return result;
  });

const rerankTop1 = async (
  query: string,
  iconNames: string[],
  limit: number,
) => {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    output: "enum",
    enum: iconNames,
    prompt: `Suggest a single icon for the query "${query}". Here are some tips to help you select the best icon:\n1. If the query is generic, suggest a generic icon.\n2. If the query is specific, suggest a specific icon.\n3. Don't recommend brand icons unless the query asks for one.\n4. Try not to suggest icons that are used for navigation or other non-content purposes, unless the query asks for one.`,
    temperature: 0,
  });
  if (!iconNames.includes(object)) {
    throw new ActionError("Could not generate icons with the proper names");
  }
  return [object, ...iconNames.filter((i) => i !== object)].slice(0, limit);
};

const rerankTopK = async (
  query: string,
  iconNames: string[],
  limit: number,
) => {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    output: "array",
    schema: z.enum(iconNames as [string, ...string[]]),
    prompt: `Suggest ${limit} icons for the query "${query}". Here are some tips to help you select the best icons:\n1. If the query is generic, suggest generic icons.\n2. If the query is specific, suggest specific icons.\n3. Don't recommend brand icons unless the query asks for one.\n4. Try not to suggest icons that are used for navigation or other non-content purposes, unless the query asks for one.\n5. Suggest exactly ${limit} icons.\n6. Return the icons in the order of relevance to the query.`,
  });
  if (object.some((i) => !iconNames.includes(i))) {
    throw new ActionError("Could not generate icons with the proper names");
  }
  if (object.length !== limit) {
    throw new ActionError("Could not generate exactly ${limit} icons");
  }
  return object;
};
