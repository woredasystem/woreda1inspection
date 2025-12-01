import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const R2_UPLOAD_URL = process.env.CLOUDFLARE_R2_UPLOAD_URL;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";

if (!R2_UPLOAD_URL || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error("❌ Missing required R2 environment variables:");
  console.error("   - CLOUDFLARE_R2_UPLOAD_URL");
  console.error("   - CLOUDFLARE_R2_ACCESS_KEY_ID");
  console.error("   - CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  process.exit(1);
}

const urlObj = new URL(R2_UPLOAD_URL);
const endpoint = `https://${urlObj.hostname}`;

console.log("\n🚀 Creating R2 bucket...");
console.log(`📦 Bucket name: ${BUCKET_NAME}`);
console.log(`🌐 Endpoint: ${endpoint}\n`);

const s3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function createBucket() {
  try {
    // Create the bucket
    console.log("Creating bucket...");
    const createCommand = new CreateBucketCommand({
      Bucket: BUCKET_NAME,
    });

    await s3Client.send(createCommand);
    console.log("✅ Bucket created successfully!");

    // Configure CORS for public access (if needed)
    try {
      console.log("\nConfiguring CORS...");
      const corsCommand = new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      });

      await s3Client.send(corsCommand);
      console.log("✅ CORS configured successfully!");
    } catch (corsError: any) {
      if (corsError.name === "NoSuchBucket" || corsError.Code === "NoSuchBucket") {
        console.log("⚠️  CORS configuration skipped (bucket may need a moment to be ready)");
      } else {
        console.log("⚠️  CORS configuration failed (this is optional):", corsError.message);
      }
    }

    console.log(`\n✅ Bucket '${BUCKET_NAME}' is ready!`);
    console.log(`\n📁 Folder structure will be:`);
    console.log(`   ${BUCKET_NAME}/`);
    console.log(`   └── woreda-9/`);
    console.log(`       └── {category-id}/`);
    console.log(`           └── {subcategory-code}/`);
    console.log(`               └── {year}/`);
    console.log(`                   └── {filename}\n`);
  } catch (error: any) {
    if (error.name === "BucketAlreadyExists" || error.Code === "BucketAlreadyOwnedByYou") {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists!`);
    } else if (error.name === "BucketAlreadyOwnedByYou") {
      console.log(`✅ Bucket '${BUCKET_NAME}' is already owned by you!`);
    } else {
      console.error("❌ Error creating bucket:", error.message);
      console.error("Full error:", error);
      process.exit(1);
    }
  }
}

createBucket();

