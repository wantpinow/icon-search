import { initializePg } from "..";
export const { conn, db } = initializePg();

export const seed = async () => {
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
