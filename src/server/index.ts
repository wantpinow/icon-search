import { env } from "~/env";

export const LOCAL_DEV = env.NODE_ENV === "development";

export const PG_TABLE_PREFIX = "iconsearch_";
