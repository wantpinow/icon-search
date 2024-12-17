import { and, desc, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { embedMany, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import {
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";
import { IconType } from "~/types/icons";
import { db } from "~/server/db";

import * as lucide from "lucide-react";

// remove anything from `lucide` that doesn't start with an uppercase letter
let lucideIcons: string[];
if (lucide.icons) {
  console.log("lucide.icons");
  lucideIcons = Object.keys(lucide.icons);
} else {
  console.log("lucide");
  lucideIcons = Object.keys(lucide).filter(
    // @ts-expect-error
    (key) => key[0] === key[0].toUpperCase(),
  );
}

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

const getIconDescriptions = async (icons: string[]) => {
  return icons;

  // Generate a concise, use-case-driven description for the Lucide icon "Pencil". Focus on the practical applications or scenarios where this icon would be used, rather than an in-depth visual description of the icon itself. Ensure the description is rich in potential search query relevance, emphasizing the icon’s function or purpose in real-world contexts. For example, describe how or where the icon might be applied in user interfaces, documentation, or designs.
  const descriptions = [];
  for (const icon of icons) {
    const res = await generateText({
      model: openai.chat("gpt-4o-mini"),
      prompt: `Generate a concise, use-case-driven description for the Lucide icon "${icon}". Focus on the practical applications or scenarios where this icon would be used, rather than an in-depth visual description of the icon itself. Ensure the description is rich in potential search query relevance, emphasizing the icon’s function or purpose in real-world contexts. For example, describe how or where the icon might be applied in user interfaces, documentation, or designs.`,
      maxTokens: 256,
    });
    descriptions.push(res.text);
  }
  return descriptions;
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

    const iconsNotInDb = lucideIcons.filter(
      (icon) => !iconNamesDb.includes(icon),
    );
    if (iconsNotInDb.length > 0 || iconNamesDb.length !== lucideIcons.length) {
      console.log(iconsNotInDb);
      console.log(iconNamesDb.length, lucideIcons.length);
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

  // find all icons in the db and not in the db
  const existingIcons = await db.query.iconTable.findMany({
    where: and(eq(iconTable.type, type), inArray(iconTable.name, lucideIcons)),
  });
  const newIconsToInsert = lucideIcons.filter(
    (icon) => !existingIcons.map((i) => i.name).includes(icon),
  );

  // get embeddings of new icons
  const newIconsEmbeddings = await embedTexts(newIconsToInsert);

  // get descriptions of new icons
  const newIconsDescriptions = await getIconDescriptions(newIconsToInsert);

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
              description: newIconsDescriptions[index]!,
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
