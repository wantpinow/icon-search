import { execSync } from "node:child_process";
import { initializePg } from "..";
export const { conn, db } = initializePg();

export const seed = async () => {
  // run migrate_local_dump.sh
  execSync("bash src/server/db/seed/migrate_local_dump.sh");

  console.time("DB has been seeded!");
  console.timeEnd("DB has been seeded!");
};

try {
  await seed();
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
