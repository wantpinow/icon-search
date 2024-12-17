import { z } from "zod";
import { ICON_TYPES } from "~/types/icons";

export const suggestIconsSchema = z.object({
  type: z.enum(ICON_TYPES),
  version: z.string().optional(),
  query: z.string().min(1, "Query is required"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit must be at most 50")
    .optional()
    .default(5),
  advanced: z.boolean().optional().default(false),
});

export const getVersionsSchema = z.object({
  type: z.enum(ICON_TYPES),
});