#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

// Load .env.local if it exists
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const envPath = join(repoRoot, ".env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (err) {
  // .env.local doesn't exist, that's okay
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
}

try {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to create admin in NODE_ENV=production.");
    process.exit(1);
  }

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Default test admin credentials
  const email = process.env.ADMIN_EMAIL || "admin@salon6.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const displayName = process.env.ADMIN_NAME || "Admin User";
  const role = process.env.ADMIN_ROLE || "owner";
  const salonId = process.env.ADMIN_SALON_ID || "00000000-0000-0000-0000-000000000001";

  console.log(`\n🔐 Creating admin account...`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: ${role}`);
  console.log(`   Salon ID: ${salonId}\n`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  let userId;
  if (existingUser) {
    console.log(`⚠️  User ${email} already exists. Using existing user...`);
    userId = existingUser.id;
  } else {
    // Create new auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      throw new Error(`Failed to create auth user: ${createError.message}`);
    }

    userId = newUser.user.id;
    console.log(`✅ Created auth user: ${userId}`);
  }

  // Check if staff_users record already exists
  const { data: existingStaff } = await supabase
    .from("staff_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingStaff) {
    console.log(`⚠️  Staff record already exists for this user.`);
    console.log(`✅ Admin account is ready to use!\n`);
    process.exit(0);
  }

  // Create staff_users record
  const { data: staffUser, error: staffError } = await supabase
    .from("staff_users")
    .insert({
      user_id: userId,
      salon_id: salonId,
      display_name: displayName,
      role,
    })
    .select("id")
    .single();

  if (staffError) {
    throw new Error(`Failed to create staff_users record: ${staffError.message}`);
  }

  console.log(`✅ Created staff_users record: ${staffUser.id}`);
  console.log(`\n✅ Admin account created successfully!`);
  console.log(`\n📝 Login credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n   You can now log in at: /login\n`);
} catch (err) {
  console.error("\n❌ Failed to create admin account:");
  console.error(err.message);
  console.error("\n💡 Make sure you have:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL set");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY set");
  console.error("   - Supabase project linked (run: supabase link)\n");
  process.exit(1);
}

