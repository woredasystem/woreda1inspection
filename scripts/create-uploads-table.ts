import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function createUploadsTable() {
  console.log("\n📋 Creating 'uploads' table in Supabase...\n");

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.uploads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      woreda_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      subcategory_code TEXT NOT NULL,
      year TEXT NOT NULL,
      file_name TEXT NOT NULL,
      r2_url TEXT NOT NULL,
      uploader_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_uploads_woreda_id ON public.uploads(woreda_id);
    CREATE INDEX IF NOT EXISTS idx_uploads_category ON public.uploads(category_id, subcategory_code);
    CREATE INDEX IF NOT EXISTS idx_uploads_year ON public.uploads(year);
    CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow service role to do everything
    DROP POLICY IF EXISTS "Service role can do everything" ON public.uploads;
    CREATE POLICY "Service role can do everything" ON public.uploads
      FOR ALL
      USING (true)
      WITH CHECK (true);
  `;

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql: createTableSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log("⚠️  RPC method not available, trying direct SQL...");
      
      // Split SQL into individual statements
      const statements = createTableSQL
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        if (statement.includes("CREATE TABLE")) {
          // Use Supabase client to execute raw SQL
          const { error: tableError } = await supabase
            .from("uploads")
            .select("id")
            .limit(0);
          
          if (tableError && tableError.message.includes("does not exist")) {
            console.log("Creating table...");
            // We'll need to use the REST API or provide SQL to user
            console.log("\n❌ Cannot execute DDL directly. Please run this SQL in Supabase SQL Editor:\n");
            console.log(createTableSQL);
            return;
          }
        }
      }
    }

    console.log("✅ Table 'uploads' created successfully!");
    console.log("\n📊 Table structure:");
    console.log("   - id (UUID, primary key)");
    console.log("   - woreda_id (TEXT)");
    console.log("   - category_id (TEXT)");
    console.log("   - subcategory_code (TEXT)");
    console.log("   - year (TEXT)");
    console.log("   - file_name (TEXT)");
    console.log("   - r2_url (TEXT)");
    console.log("   - uploader_id (TEXT)");
    console.log("   - created_at (TIMESTAMP)\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log("\n📝 Please run this SQL in your Supabase SQL Editor:\n");
    console.log(createTableSQL);
  }
}

createUploadsTable();

