import { NextResponse } from "next/server";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    const token = searchParams.get("token");

    if (!fileUrl || !token) {
      return NextResponse.json(
        { error: "File URL and token are required." },
        { status: 400 }
      );
    }

    // Validate the temporary access token
    const accessRecord = await validateTemporaryAccess(token);
    if (!accessRecord) {
      return NextResponse.json(
        { error: "Invalid or expired access token." },
        { status: 401 }
      );
    }

    // Verify the file belongs to the user's woreda
    const documents = await getDocumentsForWoreda(accessRecord.woreda_id);
    const document = documents.find((doc) => doc.r2_url === fileUrl);

    if (!document) {
      return NextResponse.json(
        { error: "File not found or access denied." },
        { status: 404 }
      );
    }

    // Fetch the file from R2
    try {
      // Convert upload URL to public URL if needed
      let fetchUrl = fileUrl;
      
      // If URL is using upload endpoint (.r2.cloudflarestorage.com), convert to public URL
      if (fileUrl.includes('.r2.cloudflarestorage.com')) {
        let publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        
        // If public URL is incorrectly set to upload endpoint, try to use known public URL
        if (!publicUrlBase || publicUrlBase.includes('.r2.cloudflarestorage.com')) {
          // Try to use the known public URL format
          // Extract account ID from upload URL or use known public URL
          const knownPublicUrl = "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev";
          publicUrlBase = knownPublicUrl;
          console.warn("⚠️  Using known public URL format for conversion");
        }
        
        // Extract the path from the upload URL
        const urlObj = new URL(fileUrl);
        const path = urlObj.pathname; // e.g., /woreda-9/000/000/2017/file.docx
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";
        
        // Construct public URL
        if (publicUrlBase.includes('pub-') && publicUrlBase.includes('.r2.dev')) {
          // Format: https://pub-ACCOUNT.r2.dev/BUCKET/path
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          fetchUrl = `${base}/${bucketName}${path}`;
        } else if (publicUrlBase.includes('.r2.dev')) {
          // Format: https://BUCKET.ACCOUNT.r2.dev/path
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          fetchUrl = `${base}${path}`;
        } else {
          // Custom domain
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          fetchUrl = `${base}${path}`;
        }
        
        console.log("URL Conversion:", { 
          original: fileUrl, 
          converted: fetchUrl,
          publicUrlBase: publicUrlBase
        });
      }
      
      console.log("Fetching file from R2:", fetchUrl);
      
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const fileResponse = await fetch(fetchUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "*/*",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("R2 response status:", fileResponse.status);
        
        if (!fileResponse.ok) {
          const errorText = await fileResponse.text().catch(() => "Unknown error");
          console.error("R2 fetch error:", errorText);
          console.error("Attempted URL:", fetchUrl);
          
          // Return a more user-friendly error
          return NextResponse.json(
            { 
              error: "Failed to fetch file from storage.",
              details: `Status: ${fileResponse.status}`,
            },
            { status: fileResponse.status }
          );
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const contentType = fileResponse.headers.get("content-type") || 
          (() => {
            // Try to determine content type from file extension
            const ext = document.file_name.split(".").pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              "pdf": "application/pdf",
              "doc": "application/msword",
              "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "xls": "application/vnd.ms-excel",
              "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "ppt": "application/vnd.ms-powerpoint",
              "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "jpg": "image/jpeg",
              "jpeg": "image/jpeg",
              "png": "image/png",
              "gif": "image/gif",
              "webp": "image/webp",
              "txt": "text/plain",
              "csv": "text/csv",
            };
            return mimeTypes[ext || ""] || "application/octet-stream";
          })();

        console.log("File fetched successfully, size:", fileBuffer.byteLength, "bytes, type:", contentType);

        // Return the file with proper headers for viewing
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${encodeURIComponent(document.file_name)}"`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === "AbortError") {
          console.error("R2 fetch timeout:", fetchUrl);
          return NextResponse.json(
            { error: "Request timeout. The file may be too large or the server is slow." },
            { status: 504 }
          );
        }
        
        console.error("Error fetching file from R2:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch file from storage." },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error("Error in file fetch process:", fetchError);
      return NextResponse.json(
        { error: "Failed to process file request." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in view-file route:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

