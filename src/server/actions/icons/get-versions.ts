"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { publicAction } from "~/server/actions";
import { getVersionsSchema } from "./schemas";
import { packageVersionTable } from "~/server/db/schema";

export const getVersionsAction = publicAction
  .schema(getVersionsSchema)
  .action(async ({ parsedInput: { type } }) => {
    const versions = await db.query.packageVersionTable.findMany({
      columns: {
        version: true,
      },
      where: eq(packageVersionTable.type, type),
      orderBy: desc(packageVersionTable.versionNumber),
    });
    return versions.map((v) => v.version);
  });
