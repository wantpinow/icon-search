import { z } from "zod";
import { ICON_TYPES } from "~/types/icons";

export const suggestIconsSchema = z.object({
  type: z.enum(ICON_TYPES),
  version: z.string().optional(),
  query: z.string(),
  limit: z.number().min(1).max(50).optional().default(5),
});
