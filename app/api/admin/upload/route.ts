import { NextResponse } from "next/server";
import { uploadDocumentToR2, saveDocumentMetadata } from "@/lib/uploads";
import { getCurrentUserWoredaId } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("category")?.toString();
    const subcategoryCode = formData.get("subcategory")?.toString();
    const year = formData.get("year")?.toString();

    console.log("Upload request received:", {
      hasFile: !!file,
      fileName: file?.name,
      categoryId,
      subcategoryCode,
      year,
    });

    if (!file || !categoryId || !subcategoryCode || !year) {
      return NextResponse.json(
        { 
          message: "Missing required upload metadata.",
          details: { hasFile: !!file, categoryId, subcategoryCode, year }
        },
        { status: 422 }
      );
    }

    // Get woreda_id from current user's metadata (Option 2)
    const woredaId = await getCurrentUserWoredaId();
    const safeName = encodeURIComponent(file.name);
    const folderPath = `${woredaId}/${categoryId}/${subcategoryCode}/${year}/${safeName}`;

    console.log("Uploading to R2:", folderPath);

    let r2Url: string;
    try {
      r2Url = await uploadDocumentToR2({
        file,
        folderPath,
      });
      console.log("R2 upload successful:", r2Url);
    } catch (r2Error) {
      console.error("R2 upload failed:", r2Error);
      return NextResponse.json(
        { 
          message: "Failed to upload file to storage.",
          error: r2Error instanceof Error ? r2Error.message : String(r2Error)
        },
        { status: 500 }
      );
    }

    try {
      await saveDocumentMetadata({
        categoryId,
        subcategoryCode,
        year,
        fileName: file.name,
        r2Url,
        uploaderId: "admin",
      });
      console.log("Metadata saved successfully");
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      return NextResponse.json(
        { 
          message: "File uploaded but failed to save metadata.",
          error: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Document uploaded successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unhandled error while uploading.";
    const stack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        message: `Upload failed: ${message}`,
        error: message,
        stack: process.env.NODE_ENV === "development" ? stack : undefined
      },
      { status: 500 }
    );
  }
}


