import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
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

console.log("\n🔧 Configuring R2 CORS...");
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

async function configureCORS() {
  try {
    // Check current CORS configuration
    try {
      const getCorsCommand = new GetBucketCorsCommand({
        Bucket: BUCKET_NAME,
      });
      const currentCors = await s3Client.send(getCorsCommand);
      console.log("📋 Current CORS configuration:");
      console.log(JSON.stringify(currentCors.CORSRules, null, 2));
    } catch (error: any) {
      if (error.name === "NoSuchCORSConfiguration") {
        console.log("ℹ️  No existing CORS configuration found");
      } else {
        console.log("⚠️  Could not read current CORS:", error.message);
      }
    }

    // Configure CORS for public access
    console.log("\n🔧 Setting up CORS for public access...");
    const corsCommand = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await s3Client.send(corsCommand);
    console.log("✅ CORS configured successfully!");
    console.log("\n📝 CORS Configuration:");
    console.log("   - Allowed Origins: * (all domains)");
    console.log("   - Allowed Methods: GET, HEAD");
    console.log("   - Allowed Headers: * (all headers)");
    console.log("   - Max Age: 3600 seconds (1 hour)");
    console.log("\n✅ Your R2 bucket is now configured for public access!");
    console.log("\n⚠️  Remember to:");
    console.log("   1. Enable public access in Cloudflare Dashboard");
    console.log("   2. Set up a custom domain or use R2.dev subdomain");
    console.log("   3. Update CLOUDFLARE_R2_PUBLIC_URL in your .env.local");
  } catch (error: any) {
    console.error("❌ Error configuring CORS:", error.message);
    if (error.name === "NoSuchBucket") {
      console.error("   The bucket doesn't exist. Run 'npm run create-r2-bucket' first.");
    }
    process.exit(1);
  }
}

configureCORS();

