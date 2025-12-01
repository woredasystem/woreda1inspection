import { NextResponse } from "next/server";
import { getQrRequestByCode } from "@/lib/access";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    if (!code) {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    const requestRecord = await getQrRequestByCode(code);
    
    if (!requestRecord) {
      return NextResponse.json(
        { status: "pending", accessToken: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: requestRecord.status,
      accessToken: requestRecord.temporary_access_token || null,
    });
  } catch (error) {
    console.error("Error checking request status:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

