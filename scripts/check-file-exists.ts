import { getSupabaseAdminClient } from "../src/lib/supabaseAdmin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";
const PUBLIC_URL_BASE = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev";

async function checkFileExists() {
  try {
    const supabase = getSupabaseAdminClient();
    
    // Get a sample document
    const { data: documents, error } = await supabase
      .from("uploads")
      .select("id, file_name, r2_url, woreda_id, category_id, subcategory_code, year")
      .limit(5);

    if (error) {
      console.error("❌ Error fetching documents:", error);
      process.exit(1);
    }

    if (!documents || documents.length === 0) {
      console.log("❌ No documents found in database");
      return;
    }

    console.log(`\n📋 Found ${documents.length} document(s) in database\n`);

    for (const doc of documents) {
      console.log("📄 Document:", doc.file_name);
      console.log("   Stored R2 URL:", doc.r2_url);
      console.log("   Path components:", {
        woredaId: doc.woreda_id,
        categoryId: doc.category_id,
        subcategoryCode: doc.subcategory_code,
        year: doc.year
      });

      // Construct expected public URL
      let expectedPublicUrl: string;
      if (PUBLIC_URL_BASE.includes('pub-') && PUBLIC_URL_BASE.includes('.r2.dev')) {
        const base = PUBLIC_URL_BASE.endsWith('/') ? PUBLIC_URL_BASE.slice(0, -1) : PUBLIC_URL_BASE;
        const folderPath = `${doc.woreda_id}/${doc.category_id}/${doc.subcategory_code}/${doc.year}/${encodeURIComponent(doc.file_name)}`;
        expectedPublicUrl = `${base}/${BUCKET_NAME}/${folderPath}`;
      } else {
        const base = PUBLIC_URL_BASE.endsWith('/') ? PUBLIC_URL_BASE.slice(0, -1) : PUBLIC_URL_BASE;
        const folderPath = `${doc.woreda_id}/${doc.category_id}/${doc.subcategory_code}/${doc.year}/${encodeURIComponent(doc.file_name)}`;
        expectedPublicUrl = `${base}/${folderPath}`;
      }

      console.log("   Expected public URL:", expectedPublicUrl);
      console.log("   URLs match:", doc.r2_url === expectedPublicUrl ? "✅ YES" : "❌ NO");

      // Test if URL is accessible
      try {
        const response = await fetch(expectedPublicUrl, { method: "HEAD" });
        console.log("   Accessibility:", response.ok ? `✅ ${response.status} OK` : `❌ ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.log("   ⚠️  File is not accessible. Possible causes:");
          console.log("      1. R2 bucket is not set to public access");
          console.log("      2. File doesn't exist at this path in R2");
          console.log("      3. Path is incorrect");
          console.log("   💡 Action: Check Cloudflare Dashboard → R2 → Your bucket");
          console.log("      - Verify file exists at the path shown above");
          console.log("      - Enable public access in bucket settings");
        }
      } catch (fetchError: any) {
        console.log("   ❌ Error testing URL:", fetchError.message);
      }

      console.log("");
    }

    console.log("\n📝 Summary:");
    console.log("   1. Check if files exist in R2 bucket at the paths shown above");
    console.log("   2. Verify bucket is set to public access in Cloudflare Dashboard");
    console.log("   3. If URLs don't match, run: npm run fix-r2-urls");
    console.log("");

  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

checkFileExists();

