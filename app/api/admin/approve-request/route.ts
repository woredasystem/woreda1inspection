import { NextResponse } from "next/server";
import { approveAccessRequest } from "@/lib/access";

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json();
    
    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    const result = await approveAccessRequest(requestId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      temporaryAccess: result.temporaryAccess 
    });
  } catch (error) {
    console.error("Error approving request:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

