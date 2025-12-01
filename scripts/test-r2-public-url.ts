import dotenv from "dotenv";
import { getSupabaseAdminClient } from "../src/lib/supabaseAdmin";

dotenv.config({ path: ".env.local" });

const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";

console.log("\n🔍 Testing R2 Public URL Configuration\n");
console.log(`📦 Bucket Name: ${BUCKET_NAME}`);
console.log(`🌐 Public URL: ${PUBLIC_URL}\n`);

if (!PUBLIC_URL) {
  console.error("❌ CLOUDFLARE_R2_PUBLIC_URL is not set in .env.local");
  process.exit(1);
}

// Test URL format
const testPaths = [
  "woreda-9/000/000/2024/test.pdf",
  "woreda-9/100/110/2023/document.docx",
];

console.log("📝 Testing URL construction:\n");

testPaths.forEach((path) => {
  const fullUrl = PUBLIC_URL.endsWith('/') 
    ? `${PUBLIC_URL}${path}`
    : `${PUBLIC_URL}/${path}`;
  
  console.log(`   Path: ${path}`);
  console.log(`   Full URL: ${fullUrl}\n`);
});

// Try to fetch a test file (if any exist in database)
async function testFileAccess() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: documents } = await supabase
      .from("uploads")
      .select("r2_url, file_name")
      .limit(1);

    if (documents && documents.length > 0) {
      const testFile = documents[0];
      console.log(`\n🧪 Testing access to existing file:`);
      console.log(`   File: ${testFile.file_name}`);
      console.log(`   URL: ${testFile.r2_url}\n`);
      
      try {
        const response = await fetch(testFile.r2_url, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });
        
        if (response.ok) {
          console.log(`✅ File is accessible! Status: ${response.status}`);
          console.log(`   Content-Type: ${response.headers.get("content-type")}`);
        } else {
          console.log(`❌ File is NOT accessible. Status: ${response.status}`);
          console.log(`   This might mean:`);
          console.log(`   - Public access is not enabled on the bucket`);
          console.log(`   - The URL format is incorrect`);
          console.log(`   - The file doesn't exist at that path`);
        }
      } catch (error: any) {
        console.log(`❌ Error accessing file: ${error.message}`);
      }
    } else {
      console.log("\nℹ️  No files found in database to test");
      console.log("   Upload a file first, then run this script again");
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
  }
}

testFileAccess();

