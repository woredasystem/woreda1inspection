import { NextResponse } from "next/server";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";

/**
 * This endpoint validates access and returns the direct R2 public URL
 * for Office documents. Microsoft Office Online Viewer requires a publicly
 * accessible URL, so we can't use our authenticated proxy.
 */
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

    // Convert upload URL to public URL if needed
    let publicUrl = fileUrl;
    
    console.log("🔍 Processing file URL:", {
      originalUrl: fileUrl,
      fileName: document.file_name,
      storedR2Url: document.r2_url,
      isUploadEndpoint: fileUrl.includes('.r2.cloudflarestorage.com'),
      isPublicUrl: fileUrl.includes('.r2.dev') || fileUrl.includes('pub-'),
      documentId: document.id,
      woredaId: document.woreda_id,
      categoryId: document.category_id,
      subcategoryCode: document.subcategory_code,
      year: document.year
    });
    
    // If URL is using upload endpoint (.r2.cloudflarestorage.com), convert to public URL
    if (fileUrl.includes('.r2.cloudflarestorage.com')) {
      let publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      
      console.log("📋 Environment config:", {
        publicUrlBase: publicUrlBase || "NOT SET",
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents"
      });
      
      // If public URL is incorrectly set to upload endpoint, use known public URL
      if (!publicUrlBase || publicUrlBase.includes('.r2.cloudflarestorage.com')) {
        const knownPublicUrl = "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev";
        publicUrlBase = knownPublicUrl;
        console.warn("⚠️  Using known public URL format for conversion:", knownPublicUrl);
      }
      
      // Extract the path from the upload URL
      try {
        const urlObj = new URL(fileUrl);
        let path = urlObj.pathname; // e.g., /woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
        
        // Remove leading slash if present, we'll add it back
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        
        // The path already contains URL-encoded filename, so we don't need to encode again
        // Just use it as-is when constructing the public URL
        
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";
        
        console.log("🔧 URL conversion details:", {
          extractedPath: path,
          bucketName: bucketName,
          publicUrlBase: publicUrlBase,
          note: "Path already contains encoded filename, using as-is"
        });
        
        // Construct public URL - path is already properly encoded
        if (publicUrlBase.includes('pub-') && publicUrlBase.includes('.r2.dev')) {
          // Format: https://pub-ACCOUNT.r2.dev/BUCKET/path
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          publicUrl = `${base}/${bucketName}/${path}`;
          console.log("✅ Constructed pub-*.r2.dev URL:", publicUrl);
        } else if (publicUrlBase.includes('.r2.dev')) {
          // Format: https://BUCKET.ACCOUNT.r2.dev/path
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          publicUrl = `${base}/${path}`;
          console.log("✅ Constructed bucket-subdomain URL:", publicUrl);
        } else {
          // Custom domain
          const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
          publicUrl = `${base}/${path}`;
          console.log("✅ Constructed custom domain URL:", publicUrl);
        }
      } catch (urlError) {
        console.error("❌ Error parsing URL:", urlError);
        return NextResponse.json(
          { error: "Invalid file URL format." },
          { status: 400 }
        );
      }
    } else if (fileUrl.includes('.r2.dev') || fileUrl.includes('pub-')) {
      // Already a public URL, but verify it's correct format
      console.log("✅ Using existing public URL:", publicUrl);
      
      // If it's a pub-*.r2.dev URL, ensure bucket name is in path
      if (publicUrl.includes('pub-') && publicUrl.includes('.r2.dev')) {
        const urlObj = new URL(publicUrl);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "woreda-documents";
        
        // Check if bucket name is already in the path
        if (pathParts[0] !== bucketName) {
          console.warn("⚠️  Bucket name missing in pub-*.r2.dev URL, fixing...");
          const base = `${urlObj.protocol}//${urlObj.host}`;
          const filePath = pathParts.join('/');
          publicUrl = `${base}/${bucketName}/${filePath}`;
          console.log("✅ Fixed public URL:", publicUrl);
        }
      }
    } else {
      console.warn("⚠️  Unknown URL format, using as-is:", publicUrl);
    }

    // Verify the public URL is accessible (quick check)
    console.log("🧪 Testing public URL accessibility:", publicUrl);
    let isAccessible = false;
    let accessibilityError: string | null = null;
    
    try {
      const testResponse = await fetch(publicUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for HEAD request
      });
      
      console.log("📊 URL test response:", {
        status: testResponse.status,
        statusText: testResponse.statusText,
        contentType: testResponse.headers.get("content-type"),
        contentLength: testResponse.headers.get("content-length")
      });
      
      if (!testResponse.ok) {
        isAccessible = false;
        accessibilityError = `HTTP ${testResponse.status}: ${testResponse.statusText}`;
        console.error("❌ Public URL is NOT accessible:", {
          url: publicUrl,
          status: testResponse.status,
          statusText: testResponse.statusText,
          note: "This could mean: 1) Bucket is not public, 2) File doesn't exist at this path, 3) Path is incorrect"
        });
        
        // Try to get more info about the error
        if (testResponse.status === 404) {
          console.error("💡 404 Error - File not found. Possible causes:");
          console.error("   1. File doesn't exist in R2 at this path");
          console.error("   2. Bucket is not public (but would usually be 403)");
          console.error("   3. Path construction is incorrect");
          console.error("   📋 Check R2 bucket to verify file exists at:", publicUrl);
        }
      } else {
        isAccessible = true;
        console.log("✅ Public URL is accessible and ready for Office viewer");
      }
    } catch (testError: any) {
      isAccessible = false;
      accessibilityError = testError.message || "Network error";
      console.error("❌ Error testing public URL:", {
        url: publicUrl,
        error: testError.message,
        name: testError.name
      });
    }

    // Return the public URL with accessibility status
    return NextResponse.json({
      publicUrl: publicUrl,
      fileName: document.file_name,
      isAccessible: isAccessible,
      error: accessibilityError,
      // Provide helpful message if not accessible
      message: !isAccessible 
        ? "The file may not be publicly accessible. Please ensure your R2 bucket is set to public access in Cloudflare Dashboard."
        : null
    });

    // Decode the path to get the original filename, then re-encode only the filename part
    // This prevents double-encoding issues
    try {
      const urlObj = new URL(publicUrl);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      // The last part is the filename - decode it to get the original, then re-encode properly
      if (pathParts.length > 0) {
        const encodedFilename = pathParts[pathParts.length - 1];
        const decodedFilename = decodeURIComponent(encodedFilename);
        const properlyEncodedFilename = encodeURIComponent(decodedFilename);
        
        // Reconstruct the path with properly encoded filename
        pathParts[pathParts.length - 1] = properlyEncodedFilename;
        const correctedPath = pathParts.join('/');
        
        // Reconstruct the URL
        publicUrl = `${urlObj.protocol}//${urlObj.host}/${correctedPath}`;
        
        console.log("🔧 Fixed encoding:", {
          original: encodedFilename,
          decoded: decodedFilename,
          reEncoded: properlyEncodedFilename,
          finalUrl: publicUrl
        });
      }
    } catch (urlFixError) {
      console.warn("⚠️  Could not fix URL encoding, using as-is:", urlFixError);
    }

    // Return the public URL (Microsoft's servers will fetch it directly)
    return NextResponse.json({
      publicUrl: publicUrl,
      fileName: document.file_name,
    });
  } catch (error) {
    console.error("Error in get-public-file-url route:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

