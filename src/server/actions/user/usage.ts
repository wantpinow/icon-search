"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { apiKeyTable, iconSuggestionRequestsTable } from "~/server/db/schema";
import { ActionError, authenticatedAction } from "..";
import { db } from "~/server/db";

export const getUserMonthlyUsageAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const [usageRes] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(iconSuggestionRequestsTable)
      .leftJoin(
        apiKeyTable,
        eq(apiKeyTable.id, iconSuggestionRequestsTable.apiKeyId),
      )
      .where(
        and(
          eq(apiKeyTable.userId, user.id),
          gte(
            iconSuggestionRequestsTable.datetime,
            sql`CURRENT_TIMESTAMP - INTERVAL '1 month'`,
          ),
        ),
      );
    if (usageRes === undefined) {
      throw new ActionError("Could not get user usage");
    }
    return usageRes.count;
  },
);
