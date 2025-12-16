#!/usr/bin/env node
import { execSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

function run(cmd, cwd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
}

try {
  const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

  // Confirm Supabase CLI is available before attempting migration.
  run("supabase -v", repoRoot);

  // Apply all pending migrations to the currently linked project.
  run("supabase db push", repoRoot);

  console.log("\n✅ Supabase migrations applied successfully.\n");
} catch (err) {
  console.error(err);
  console.error("\n❌ Migration failed.\n");
  process.exit(1);
}
