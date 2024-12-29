// app/login/github/callback/route.ts
import {
  generateSessionToken,
  createSession,
  setSessionTokenCookie,
} from "~/lib/session";
import { github } from "~/lib/oauth";
import { cookies } from "next/headers";

import type { OAuth2Tokens } from "arctic";
import { createUserFromGitHubId, getUserFromGitHubId } from "~/lib/github";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
  if (code === null || state === null || storedState === null) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const githubUser: GitHubUser = await githubUserResponse.json();
  const githubUserId = githubUser.id;
  const githubUsername = githubUser.login;
  const githubEmail = githubUser.email;
  const githubAvatarUrl = githubUser.avatar_url;
  const existingUser = await getUserFromGitHubId(githubUserId);

  if (existingUser !== null) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  }

  const user = await createUserFromGitHubId(
    githubUserId,
    githubUsername,
    githubEmail,
    githubAvatarUrl,
  );

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
    },
  });
}

interface GitHubUser {
  id: number;
  email: string;
  login: string;
  avatar_url: string;
}
