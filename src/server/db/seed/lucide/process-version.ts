import { and, desc, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

import {
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";
import { IconType } from "~/types/icons";
import { db } from "~/server/db";

// @ts-ignore (sometimes not typed)
import lucide from "lucide";

const args = process.argv.slice(2); // Get just the custom arguments

const iconType = args[0];
const version = args[1];

if (!iconType) {
  throw new Error("Icon type is required");
}

if (!version) {
  throw new Error("Version is required");
}

const embedTexts = async (texts: string[]) => {
  const embeddings = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });
  return embeddings.embeddings;
};

const processLucideIcons = async (type: IconType, version: string) => {
  // check this version has already been processed
  const existingVersion = await db.query.packageVersionTable.findFirst({
    where: and(
      eq(packageVersionTable.type, type),
      eq(packageVersionTable.version, version),
    ),
  });

  if (existingVersion) {
    console.log("Version already processed", existingVersion.versionNumber);

    const iconsInVersion = await db.query.iconVersionTable.findMany({
      where: and(
        eq(iconVersionTable.type, type),
        lte(iconVersionTable.rangeStart, existingVersion.versionNumber),
        gte(iconVersionTable.rangeEnd, existingVersion.versionNumber),
      ),
      with: {
        icon: {
          columns: {
            name: true,
          },
        },
      },
    });

    const iconNamesDb = iconsInVersion.map((i) => i.icon.name);
    const iconsNamesLucide = Object.keys(lucide.icons);

    const iconsNotInDb = iconsNamesLucide.filter(
      (icon) => !iconNamesDb.includes(icon),
    );
    if (
      iconsNotInDb.length > 0 ||
      iconNamesDb.length !== iconsNamesLucide.length
    ) {
      console.log(iconsNotInDb);
    }

    return;
  }

  // get the latest version number
  const latestVersion = await db.query.packageVersionTable.findFirst({
    where: eq(packageVersionTable.type, type),
    orderBy: desc(packageVersionTable.versionNumber),
  });
  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  // insert the new version
  await db.insert(packageVersionTable).values({
    type: type,
    version,
    versionNumber,
  });

  // get the icons in this version
  const icons = Object.keys(lucide.icons);

  // find all icons in the db and not in the db
  const existingIcons = await db.query.iconTable.findMany({
    where: and(eq(iconTable.type, type), inArray(iconTable.name, icons)),
  });
  const newIconsToInsert = icons.filter(
    (icon) => !existingIcons.map((i) => i.name).includes(icon),
  );

  // get embeddings of new icons
  const newIconsEmbeddings = await embedTexts(newIconsToInsert);

  // insert the new icons
  const newIcons =
    newIconsToInsert.length === 0
      ? []
      : await db
          .insert(iconTable)
          .values(
            newIconsToInsert.map((icon, index) => ({
              type: type,
              name: icon,
              embedding: newIconsEmbeddings[index]!,
            })),
          )
          .returning();

  const allIcons = [...existingIcons, ...newIcons];

  //   get all icon ranges with the max equal to previous version number
  const existingIconRanges =
    versionNumber === 1
      ? []
      : await db.query.iconVersionTable.findMany({
          where: and(
            inArray(
              iconVersionTable.iconId,
              allIcons.map((i) => i.id),
            ),
            eq(iconVersionTable.rangeEnd, versionNumber - 1),
          ),
        });
  for (const range of existingIconRanges) {
    const icon = allIcons.find((i) => i.id === range.iconId);
    if (icon) {
      await db
        .update(iconVersionTable)
        .set({
          rangeEnd: versionNumber,
        })
        .where(eq(iconVersionTable.id, range.id));
    }
  }

  const newIconRanges = allIcons.filter(
    (i) => !existingIconRanges.map((r) => r.iconId).includes(i.id),
  );

  if (newIconRanges.length > 0) {
    await db.insert(iconVersionTable).values(
      newIconRanges.map((icon) => ({
        type: type,
        iconId: icon.id,
        rangeStart: versionNumber,
        rangeEnd: versionNumber,
      })),
    );
  }

  return version;
};

processLucideIcons(iconType as IconType, version)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// console.log(Object.keys(lucide.icons).length);

// export const processLucideIcons = async () => {
//   const icons = Object.keys(lucide.icons);
//   console.log(icons.length);
// };
