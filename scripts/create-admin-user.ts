/**
 * Script to create an admin user in Supabase
 * 
 * Run with: npm run create-admin
 * 
 * Make sure your .env.local has:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (value && !value.startsWith("#")) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, "");
      }
    }
  });
} catch (error) {
  console.warn("⚠️  Could not load .env.local, using process.env");
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = process.argv[2] || "admin@woreda9.gov";
  const password = process.argv[3] || "Admin@123456";
  const woredaId = process.argv[4] || process.env.NEXT_PUBLIC_WOREDA_ID || "woreda-9";

  console.log(`\n🔐 Creating admin user...`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`🏛️  Woreda ID: ${woredaId}\n`);

  try {
    // Create the user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: "admin",
        woreda_id: woredaId, // Assign woreda to user
      },
    });

    if (userError) {
      console.error("❌ Error creating user:", userError.message);
      process.exit(1);
    }

    console.log("✅ Admin user created successfully!");
    console.log(`👤 User ID: ${userData.user.id}`);
    console.log(`📧 Email: ${userData.user.email}`);
    console.log(`🏛️  Assigned to: ${woredaId}`);
    console.log(`\n💡 You can now login at: http://localhost:3000/admin/login`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log(`📝 Usage: npm run create-admin <email> <password> <woreda-id>`);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

createAdminUser();

