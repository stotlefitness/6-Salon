#!/usr/bin/env node
import { execSync } from "node:child_process";
import { access, constants } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function run(cmd, cwd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
}

try {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to run seed in NODE_ENV=production.");
    process.exit(1);
  }

  const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  const seedPath = join(repoRoot, "db/seed.sql");

  await access(seedPath, constants.R_OK);

  // Ensure Supabase CLI is present.
  run("supabase -v", repoRoot);

  // Apply seed to the linked database without dropping data.
  run(`supabase db execute --file "${seedPath}"`, repoRoot);

  console.log("\n✅ Seed applied from db/seed.sql.\n");
} catch (err) {
  console.error(err);
  console.error("\n❌ Seed failed.\n");
  process.exit(1);
}
