"use server";

import { embed, generateObject, TypeValidationError } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, cosineDistance, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { ActionError, publicAction } from "~/server/actions";
import { suggestIconsSchema } from "./schemas";
import {
  apiKeyTable,
  iconSuggestionRequestsTable,
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";
import { z } from "zod";
import { headers } from "next/headers";
import { hashApiKey } from "../keys/utils";

export async function getIPAddress() {
  return headers().get("x-forwarded-for");
}

// 10 requests per minute for unauthenticated requests
const UNAUTHENTICATED_REQUEST_TIME_FRAME = 60;
const UNAUTHENTICATED_REQUEST_LIMIT = 10;

export const suggestIconsAction = publicAction
  .schema(
    suggestIconsSchema.extend({
      apiKey: z.string().optional(),
    }),
  )
  .action(
    async ({ parsedInput: { query, type, version, limit, mode, apiKey } }) => {
      let ipAddress: string | undefined;
      let apiKeyId: string | undefined;
      if (apiKey) {
        // hash the api key
        const hashedApiKey = hashApiKey(apiKey);
        console.log(`Hashed API key: ${hashedApiKey}`);

        // check the api key
        const apiKeyRes = await db.query.apiKeyTable.findFirst({
          where: and(
            eq(apiKeyTable.keyHash, hashedApiKey),
            eq(apiKeyTable.revoked, false),
          ),
        });
        if (!apiKeyRes) {
          throw new ActionError("Invalid API key");
        }
        apiKeyId = apiKeyRes.id;

        // todo: check rate limits
      } else {
        // get the ip address
        ipAddress = (await getIPAddress()) ?? undefined;
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
          description: iconTable.description,
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
      const iconDescriptions = res.map((r) => r.description);
      let result: string[];

      if (mode === "semantic") {
        result = iconNames.slice(0, limit);
      } else {
        // rerank with gpt-4o
        console.time("Reranking");
        try {
          if (mode === "top-1") {
            result = await rerankTop1(
              query,
              iconNames,
              iconDescriptions,
              limit,
            );
          } else if (mode === "top-k") {
            result = await rerankTopK(
              query,
              iconNames,
              iconDescriptions,
              limit,
            );
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
        apiKeyId,
        query,
        mode,
        type,
        versionNumber,
        limit,
        result,
      });

      return result;
    },
  );

const RERANK_TOP_1_SYSTEM_PROMPT = `You are an expert content creator and designer. You are given a user query and a list of icons and their descriptions. You are tasked with selecting the most relevant icon for the query. Here are some tips to help you select the best icon:

1. If the query is generic, suggest a generic icon.
2. If the query is specific, suggest a specific icon.
3. Don't recommend brand icons unless the query asks for one.
4. Try not to suggest icons that are used for navigation or other non-content purposes, unless the query asks for one.
5. Return the name of the icon that is most relevant to the query.
6. Return the exact name of your chosen icon, nothing else.
7. Do not make up your own icon names, only return one of the provided icon names.

You will be given a set of candidate icons and their descriptions, followed by a user query. You will then return the name of the icon that is most relevant to the query. Return the exact name of your chosen icon, nothing else.`;

const rerankTop1 = async (
  query: string,
  iconNames: string[],
  iconDescriptions: string[],
  limit: number,
) => {
  const { object, usage } = await generateObject({
    model: openai("gpt-4o-mini"),
    output: "enum",
    enum: iconNames,
    messages: [
      {
        role: "system",
        content: RERANK_TOP_1_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Available icons and their descriptions:\n ${iconNames.map((name, index) => `${name}: ${iconDescriptions[index]}`).join("\n")}`,
          },
          {
            type: "text",
            text: `User query: ${query}`,
          },
        ],
      },
    ],
    temperature: 0,
  });
  console.log(usage);
  if (!iconNames.includes(object)) {
    throw new ActionError("Could not generate icons with the proper names");
  }
  return [object, ...iconNames.filter((i) => i !== object)].slice(0, limit);
};

const RERANK_TOP_K_SYSTEM_PROMPT = `You are an expert content creator and designer. You are given a user query and a list of icons with descriptions. You must select exactly {limit} icons that best match the query, following these guidelines:

1. If the query is generic, suggest generic icons.
2. If the query is specific, suggest specific icons.
3. Don't recommend brand icons unless the query asks for them.
4. Avoid icons primarily for navigation or non-content purposes unless requested.
5. Return only the n most relevant icons, each as its exact name from the provided list.
6. Do not invent new icon names; only use those given.
7. Return the icon names as an array of strings, with no extra text or explanation.
8. Return the icon names in the order of relevance to the query.
9. Return exactly {limit} icons.`;

const rerankTopK = async (
  query: string,
  iconNames: string[],
  iconDescriptions: string[],
  limit: number,
) => {
  const { object, usage } = await generateObject({
    model: openai("gpt-4o-mini"),
    output: "array",
    schema: z.enum(iconNames as [string, ...string[]]),
    messages: [
      {
        role: "system",
        content: RERANK_TOP_K_SYSTEM_PROMPT.replace(
          "{limit}",
          limit.toString(),
        ),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Available icons and their descriptions:\n ${iconNames.map((name, index) => `${name}: ${iconDescriptions[index]}`).join("\n")}`,
          },
          {
            type: "text",
            text: `User query: ${query}`,
          },
        ],
      },
    ],
  });
  console.log(usage);
  if (object.some((i) => !iconNames.includes(i))) {
    throw new ActionError("Could not generate icons with the proper names");
  }
  if (object.length !== limit) {
    throw new ActionError("Could not generate exactly ${limit} icons");
  }
  return object;
};
