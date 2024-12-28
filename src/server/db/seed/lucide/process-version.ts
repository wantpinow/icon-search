import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { embedMany, generateText } from "ai";
import React from "react";
import { renderToString } from "react-dom/server";
import { openai } from "@ai-sdk/openai";
import cliProgress from "cli-progress";

import {
  iconTable,
  iconVersionTable,
  packageVersionTable,
} from "~/server/db/schema";
import { IconType } from "~/types/icons";
import { db } from "~/server/db";

import * as lucide from "lucide-react";
import sharp from "sharp";

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

const ICON_DESCRIPTION_SYSTEM_PROMPT = `You are a helpful assistant that can describe icons, given a name and an image of the icon. You will be provided with the name of the icon and a visual reference (or image). Your task is to:

1. Start with the name of the icon, followed by a short sentence describing its appearance.
2. Provide a concise, use-case-driven description focusing on how and where the icon would be used. Avoid extensive visual details—prioritize practical applications and real-world contexts (e.g., software interfaces, documentation, dashboards, etc.).
3. Ensure the description is rich in potential search query relevance and highlights the icon's function or purpose rather than just its aesthetics.

Below are examples of good descriptions for different icons:

- ArrowBigDownDash Icon: A large downward-pointing arrow with a dashed line in its stem. Indicates downloads, downward navigation, or additional content, guiding users toward file transfers, scrolling, or important items below the current view.
- Gauge Icon: A circular dial with a needle set against incremental markings. Shows performance, speed, or progress at a glance, used in dashboards, monitoring tools, and project management interfaces for quick status assessments.
- TowerControl Icon: A tall tower silhouette with a control deck near the top. Represents an air traffic control tower, symbolizing communication, coordination, and oversight in aviation software, flight simulators, and airport management tools.
- Volume1 Icon: A speaker silhouette accompanied by a single sound wave. Indicates a moderate audio level, used in media players, audio settings, and interfaces where users need discreet volume control.

Follow this format when generating icon descriptions. DO NOT include symbols such as ** or * surrounding the icon name.`;

const generateIconDescription = async (icon: string, iconSvg: string) => {
  const jpegBuffer = await sharp(Buffer.from(iconSvg))
    .resize(96, 96)
    .flatten({ background: "#ffffff" }) // Add white background
    .jpeg()
    .toBuffer();
  const res = await generateText({
    model: openai.chat("gpt-4o"),
    messages: [
      {
        role: "system",
        content: ICON_DESCRIPTION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Icon Name: ${icon}`,
          },
          {
            type: "image",
            image: jpegBuffer,
          },
        ],
      },
    ],
    maxTokens: 256,
  });
  return res.text;
};

const getIconDescriptions = async (icons: string[], svgStrings: string[]) => {
  const descriptions: string[] = new Array(icons.length);
  const batchSize = 20;

  // Create a progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      "Generating icon descriptions |{bar}| {percentage}% | {value}/{total} icons",
    barCompleteChar: "=",
    barIncompleteChar: " ",
  });

  // Start the progress bar
  progressBar.start(icons.length, 0);
  let completed = 0;

  // Process icons in batches
  for (let i = 0; i < icons.length; i += batchSize) {
    const batch = icons.slice(i, i + batchSize);
    const batchSvgs = svgStrings.slice(i, i + batchSize);

    const batchPromises = batch.map((icon, index) =>
      generateIconDescription(icon, batchSvgs[index]!).then((description) => {
        const position = i + index;
        descriptions[position] = description;
        completed++;
        progressBar.update(completed);
      }),
    );
    await Promise.all(batchPromises);
  }

  // Stop the progress bar
  progressBar.stop();

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
  const newIconsSvgStrings = newIconsToInsert.map((icon) =>
    // @ts-expect-error
    renderToString(React.createElement(lucide[icon])),
  );

  // get descriptions of new icons
  const newIconsDescriptions = await getIconDescriptions(
    newIconsToInsert,
    newIconsSvgStrings,
  );

  // get embeddings of new icons
  const newIconsEmbeddings = await embedTexts(newIconsDescriptions);

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

  // get all icon ranges with the max equal to previous version number
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
