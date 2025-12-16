#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to run seed in NODE_ENV=production.");
    process.exit(1);
  }

  // Ensure Supabase CLI is present.
  run("supabase -v");

  // Reset the linked database, reapply migrations, and run supabase/seed.sql.
  run("supabase db reset --force");

  console.log("\n✅ Database reset and seeded from supabase/seed.sql.\n");
} catch (err) {
  console.error(err);
  console.error("\n❌ Seed/reset failed.\n");
  process.exit(1);
}
