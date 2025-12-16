#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  // Confirm Supabase CLI is available before attempting migration.
  run("supabase -v");

  // Apply all pending migrations to the currently linked project.
  run("supabase db push");

  console.log("\n✅ Supabase migrations applied successfully.\n");
} catch (err) {
  console.error(err);
  console.error("\n❌ Migration failed.\n");
  process.exit(1);
}
