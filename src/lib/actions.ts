"use server";

import { redirect } from "next/navigation";
import { deleteSessionTokenCookie } from "./session";

import { invalidateSession } from "./session";
import { auth } from "./validate";

export async function logout(): Promise<LogoutActionResult> {
  "use server";
  const { session } = await auth();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/");
}

interface LogoutActionResult {
  error: string | null;
}
