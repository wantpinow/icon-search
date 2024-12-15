// doing protection here instead of in the middleware

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { UserProvider } from "~/lib/auth/provider";
import { auth } from "~/lib/auth/validate";

// because https://github.com/vercel/next.js/discussions/50177
export async function WithAuth({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const header_url = headersList.get("x-url");
  const { user } = await auth();
  if (!user) {
    let redirectUrl = `/sign-in`;
    if (header_url) {
      redirectUrl = `/sign-in?redirect=${encodeURIComponent(header_url)}`;
    }
    redirect(redirectUrl);
  }
  return <UserProvider user={user}>{children}</UserProvider>;
}
