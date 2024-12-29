"use server";

import { z } from "zod";
import { ActionError, authenticatedAction } from "..";
import { createApiKeySchema } from "./schemas";
import { apiKeyTable } from "~/server/db/schema";
import { db } from "~/server/db";
import { and, eq } from "drizzle-orm";
import { generateApiKey, hashApiKey } from "./utils";

export const createApiKeyAction = authenticatedAction
  .schema(createApiKeySchema)
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    const [row] = await db
      .insert(apiKeyTable)
      .values({
        name,
        userId: user.id,
        keyHash: apiKeyHash,
      })
      .returning();

    if (row === undefined) {
      throw new ActionError("Failed to create API key");
    }

    return {
      key: apiKey,
      row,
    };
  });

export const getUserApiKeysAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const keys = await db.query.apiKeyTable.findMany({
      where: and(
        eq(apiKeyTable.userId, user.id),
        eq(apiKeyTable.revoked, false),
      ),
      with: {
        iconSuggestionRequests: {
          columns: {
            datetime: true,
          },
          orderBy: (iconSuggestionRequests, { desc }) => [
            desc(iconSuggestionRequests.datetime),
          ],
          limit: 1,
        },
      },
    });
    const keysWithLastUsed = keys.map((key) => ({
      ...key,
      lastUsed: key.iconSuggestionRequests[0]?.datetime,
    }));
    return keysWithLastUsed;
  },
);

export const revokeApiKeyAction = authenticatedAction
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    const [row] = await db
      .update(apiKeyTable)
      .set({ revoked: true, revokedAt: new Date() })
      .where(and(eq(apiKeyTable.id, id), eq(apiKeyTable.userId, user.id)))
      .returning();
    if (row === undefined) {
      throw new ActionError("Failed to revoke API key");
    }
    return row;
  });
