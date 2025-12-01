import { getSupabaseAdminClient } from "../src/lib/supabaseAdmin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";

if (!PUBLIC_URL) {
  console.error("❌ CLOUDFLARE_R2_PUBLIC_URL is not set in .env.local");
  process.exit(1);
}

async function fixR2Urls() {
  try {
    const supabase = getSupabaseAdminClient();
    
    // Get all documents with upload endpoint URLs
    const { data: documents, error: fetchError } = await supabase
      .from("uploads")
      .select("id, r2_url, file_name")
      .like("r2_url", "%.r2.cloudflarestorage.com%");

    if (fetchError) {
      console.error("❌ Error fetching documents:", fetchError);
      process.exit(1);
    }

    if (!documents || documents.length === 0) {
      console.log("✅ No documents with upload endpoint URLs found. All URLs are already correct!");
      return;
    }

    console.log(`\n🔧 Found ${documents.length} documents with upload endpoint URLs\n`);
    console.log(`📋 Configuration:`);
    console.log(`   Public URL Base: ${PUBLIC_URL}`);
    console.log(`   Bucket Name: ${BUCKET_NAME}\n`);

    let updated = 0;
    let errors = 0;

    for (const doc of documents) {
      try {
        // Extract path from upload URL
        const urlObj = new URL(doc.r2_url);
        const path = urlObj.pathname; // e.g., /woreda-9/000/000/2017/file.docx
        
        // Construct new public URL
        let newUrl: string;
        if (PUBLIC_URL.includes('pub-') && PUBLIC_URL.includes('.r2.dev')) {
          // Format: https://pub-ACCOUNT.r2.dev/BUCKET/path
          // The bucket name MUST be in the path for pub-*.r2.dev URLs
          const base = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL;
          newUrl = `${base}/${BUCKET_NAME}${path}`;
        } else if (PUBLIC_URL.includes('.r2.dev') && !PUBLIC_URL.includes('pub-')) {
          // Format: https://BUCKET.ACCOUNT.r2.dev/path (bucket-specific subdomain)
          const base = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL;
          newUrl = `${base}${path}`;
        } else {
          // Custom domain or other format
          const base = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL;
          newUrl = `${base}${path}`;
        }
        
        console.log(`\n📄 Processing: ${doc.file_name}`);
        console.log(`   Old URL: ${doc.r2_url}`);
        console.log(`   Path: ${path}`);
        console.log(`   New URL: ${newUrl}`);
        console.log(`   Match: ${newUrl === doc.r2_url ? 'YES (will skip)' : 'NO (will update)'}`);
        
        // Only update if the URL is actually different
        if (newUrl === doc.r2_url) {
          console.log(`   ⚠️  Skipped (URL unchanged)\n`);
          continue;
        }

        // Update the URL in database
        const { error: updateError } = await supabase
          .from("uploads")
          .update({ r2_url: newUrl })
          .eq("id", doc.id);

        if (updateError) {
          console.error(`❌ Error updating ${doc.file_name}:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ Updated: ${doc.file_name}`);
          console.log(`   Old: ${doc.r2_url}`);
          console.log(`   New: ${newUrl}\n`);
          updated++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${doc.file_name}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📁 Total: ${documents.length}\n`);
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

fixR2Urls();

