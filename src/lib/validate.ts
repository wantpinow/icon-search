import { cookies } from "next/headers";
import { cache } from "react";
import { type SessionValidationResult, validateSessionToken } from "./session";

export const auth = cache(async (): Promise<SessionValidationResult> => {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value ?? null;
  if (token === null) {
    return { session: null, user: null };
  }
  const result = await validateSessionToken(token);
  return result;
});
