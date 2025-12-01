import { getSupabaseAdminClient } from "./supabaseAdmin";
import { requiredEnv, publicEnv } from "./env";
import type { DocumentUploadRecord } from "@/types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadDocumentToR2(args: {
  folderPath: string;
  file: File;
}): Promise<string> {
  try {
    const uploadUrl = requiredEnv.CLOUDFLARE_R2_UPLOAD_URL();
    const publicUrlBase = requiredEnv.CLOUDFLARE_R2_PUBLIC_URL();
    
    // R2 public URLs format depends on the type:
    // 1. pub-*.r2.dev format: https://pub-ACCOUNT.r2.dev/BUCKET/path
    // 2. BUCKET.*.r2.dev format: https://BUCKET.ACCOUNT.r2.dev/path
    // 3. Custom domain: https://domain.com/path
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";
    
    // Construct public URL
    let publicUrl: string;
    if (publicUrlBase.includes('pub-') && publicUrlBase.includes('.r2.dev')) {
      // Format: https://pub-ACCOUNT.r2.dev/BUCKET/path
      // The bucket name MUST be in the path for pub-*.r2.dev URLs
      const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
      publicUrl = `${base}/${bucketName}/${args.folderPath}`;
    } else if (publicUrlBase.includes('.r2.dev') && !publicUrlBase.includes('pub-')) {
      // Format: https://BUCKET.ACCOUNT.r2.dev/path (bucket-specific subdomain)
      publicUrl = publicUrlBase.endsWith('/')
        ? `${publicUrlBase}${args.folderPath}`
        : `${publicUrlBase}/${args.folderPath}`;
    } else {
      // Custom domain or other format
      publicUrl = publicUrlBase.endsWith('/')
        ? `${publicUrlBase}${args.folderPath}`
        : `${publicUrlBase}/${args.folderPath}`;
    }
    
    console.log("R2 Public URL Construction:", {
      publicUrlBase,
      bucketName,
      folderPath: args.folderPath,
      constructedUrl: publicUrl,
      urlType: publicUrlBase.includes('pub-') ? 'pub-account' : publicUrlBase.includes('.r2.dev') ? 'bucket-subdomain' : 'custom-domain'
    });

    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("Cloudflare R2 credentials (CLOUDFLARE_R2_ACCESS_KEY_ID and CLOUDFLARE_R2_SECRET_ACCESS_KEY) are not configured.");
    }

    // R2 endpoint format: https://{account-id}.r2.cloudflarestorage.com
    // Bucket name: "woreda-documents" (single bucket for all woredas)
    // Folder structure: woreda-id/category/subcategory/year/filename
    const urlObj = new URL(uploadUrl);
    const endpoint = `https://${urlObj.hostname}`;
    
    // bucketName is already defined above, no need to redeclare

    console.log("R2 Upload Details:", {
      endpoint,
      bucketName,
      key: args.folderPath,
      fileName: args.file.name,
      fileSize: args.file.size,
    });

    const fileBuffer = await args.file.arrayBuffer();
    const contentType = args.file.type || "application/octet-stream";

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true, // R2 requires path-style URLs
    });

    // Upload to R2 using S3-compatible API
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: args.folderPath,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType,
    });

    console.log("Uploading to R2...");
    await s3Client.send(command);
    console.log("R2 upload successful, returning public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("uploadDocumentToR2 error:", error);
    throw error;
  }
}

import { getCurrentUserWoredaId } from "./supabaseServer";

export async function saveDocumentMetadata(args: {
  categoryId: string;
  subcategoryCode: string;
  year: string;
  fileName: string;
  r2Url: string;
  uploaderId: string;
}): Promise<DocumentUploadRecord> {
  // Get woreda_id from current user's metadata (Option 2)
  const woredaId = await getCurrentUserWoredaId();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("uploads")
    .insert({
      woreda_id: woredaId,
      category_id: args.categoryId,
      subcategory_code: args.subcategoryCode,
      year: args.year,
      file_name: args.fileName,
      r2_url: args.r2Url,
      uploader_id: args.uploaderId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save metadata: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to save metadata: No data returned from database.");
  }

  return data;
}

export async function getDocumentsForWoreda(
  woredaId: string
): Promise<DocumentUploadRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("uploads")
    .select("*")
    .eq("woreda_id", woredaId)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getDocumentsForCurrentWoreda(): Promise<DocumentUploadRecord[]> {
  // Get woreda_id from current user's metadata (Option 2)
  const woredaId = await getCurrentUserWoredaId();
  return getDocumentsForWoreda(woredaId);
}

