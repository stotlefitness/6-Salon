import { access, constants, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const schemaPath = join(currentDir, "../db/schema.sql");
  const migrationPath = join(
    currentDir,
    "../supabase/migrations/20251210T000000_base.sql",
  );

  const sql = await readFile(schemaPath, "utf8");
  console.log("Schema ready for application with Supabase CLI or psql:");
  console.log(`- Source schema: ${schemaPath}`);
  console.log(`- Base migration: ${migrationPath}`);
  console.log(sql.slice(0, 200) + (sql.length > 200 ? "..." : ""));

  try {
    await access(migrationPath, constants.R_OK);
  } catch {
    console.warn(
      "Warning: base migration file missing. Ensure supabase/migrations exists before pushing.",
    );
  }

  console.log(
    "Run `supabase db reset --use-migrations` (local) or `supabase db push` once Supabase CLI is configured.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


