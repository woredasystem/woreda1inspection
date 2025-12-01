import { NextRequest, NextResponse } from "next/server";
import { validateTemporaryAccess } from "@/lib/access";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { requiredEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  try {
    // Get token from query params
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const fileUrl = searchParams.get("url");

    if (!token || !fileUrl) {
      return NextResponse.json(
        { error: "Token and file URL are required." },
        { status: 400 }
      );
    }

    // Validate temporary access
    const accessRecord = await validateTemporaryAccess(token);
    if (!accessRecord) {
      return NextResponse.json(
        { error: "Invalid or expired access token." },
        { status: 401 }
      );
    }

    // Extract the file path from the R2 URL
    // R2 URL format: https://PUBLIC_URL/woreda-id/category/subcategory/year/filename
    const urlObj = new URL(fileUrl);
    const filePath = urlObj.pathname.substring(1); // Remove leading slash

    // Get R2 credentials
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: "R2 credentials not configured." },
        { status: 500 }
      );
    }

    // Extract endpoint from upload URL
    const uploadUrl = requiredEnv.CLOUDFLARE_R2_UPLOAD_URL();
    const urlObj2 = new URL(uploadUrl);
    const endpoint = `https://${urlObj2.hostname}`;

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });

    // Fetch file from R2
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return NextResponse.json(
        { error: "File not found." },
        { status: 404 }
      );
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = response.ContentType || "application/octet-stream";
    const fileName = filePath.split("/").pop() || "file";

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to serve file",
      },
      { status: 500 }
    );
  }
}

