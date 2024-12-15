import { db } from "~/server/db";
import { User, userTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromGitHubId(
  githubUserId: number,
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.githubId, githubUserId.toString()))
    .limit(1);
  return user ?? null;
}

export async function createUserFromGitHubId(
  githubUserId: number,
  githubUsername: string,
  githubEmail: string,
): Promise<User> {
  const [user] = await db
    .insert(userTable)
    .values({
      githubId: githubUserId.toString(),
      username: githubUsername,
      email: githubEmail,
    })
    .returning();
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
}
