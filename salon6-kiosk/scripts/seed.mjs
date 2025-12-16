import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const seedPath = join(currentDir, "../db/seed.sql");
  const sql = await readFile(seedPath, "utf8");

  console.log("Ready to load seed data via Supabase CLI:");
  console.log(`- File: ${seedPath}`);
  console.log(sql.slice(0, 200) + (sql.length > 200 ? "..." : ""));
  // TODO: execute seed against local database connection.
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


