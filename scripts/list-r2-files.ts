import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const UPLOAD_URL = process.env.CLOUDFLARE_R2_UPLOAD_URL;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";

if (!UPLOAD_URL || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error("❌ Missing R2 credentials in .env.local");
  process.exit(1);
}

const urlObj = new URL(UPLOAD_URL);
const endpoint = `https://${urlObj.hostname}`;

const s3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function listFiles() {
  try {
    console.log(`\n📂 Listing files in bucket: ${BUCKET_NAME}\n`);
    console.log(`🔗 Endpoint: ${endpoint}\n`);

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 100,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log("❌ No files found in bucket");
      return;
    }

    console.log(`✅ Found ${response.Contents.length} file(s):\n`);

    for (const obj of response.Contents) {
      if (!obj.Key) continue;
      
      const publicUrl = `https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/${BUCKET_NAME}/${obj.Key}`;
      
      console.log(`📄 ${obj.Key}`);
      console.log(`   Size: ${obj.Size} bytes`);
      console.log(`   Last Modified: ${obj.LastModified}`);
      console.log(`   Public URL: ${publicUrl}`);
      
      // Test if accessible
      try {
        const testRes = await fetch(publicUrl, { method: "HEAD" });
        console.log(`   Accessible: ${testRes.ok ? "✅ YES" : `❌ NO (${testRes.status})`}`);
      } catch (err) {
        console.log(`   Accessible: ❌ Error testing`);
      }
      
      console.log("");
    }

    console.log("\n💡 Note: If files are not accessible, verify:");
    console.log("   1. Bucket is set to public access in Cloudflare Dashboard");
    console.log("   2. CORS is configured correctly");
    console.log("   3. File paths match what's stored in the database\n");

  } catch (error: any) {
    console.error("❌ Error listing files:", error.message);
    process.exit(1);
  }
}

listFiles();

