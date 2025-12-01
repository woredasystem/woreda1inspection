import { headers } from "next/headers";
import { recordQrAccessRequest, getQrRequestByCode } from "@/lib/access";
import { RequestStatusChecker } from "@/components/RequestStatusChecker";

export const metadata = {
  title: "Request temporary access",
  description: "Secure QR request flow for temporary document viewing.",
};

export const dynamic = "force-dynamic";

interface RequestAccessPageProps {
  searchParams: Promise<{
    code?: string;
    ip?: string;
  }>;
}

const getClientIp = async (providedIp?: string) => {
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = requestHeaders.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
    if (providedIp) {
      return providedIp;
    }
    return "Unknown IP";
  } catch (error) {
    console.error("Error getting client IP:", error);
    return providedIp || "Unknown IP";
  }
};

export default async function RequestAccessPage({
  searchParams,
}: RequestAccessPageProps) {
  const params = await searchParams;
  const clientIp = await getClientIp(params.ip);
  
  // Record the request if code is provided
  if (params.code) {
    try {
      const result = await recordQrAccessRequest({
        code: params.code,
        ipAddress: clientIp,
      });
      if (!result) {
        console.error("Failed to record QR request - check Supabase connection");
      }
    } catch (error) {
      console.error("Error recording QR request:", error);
    }
  }

  // Get the current status of the request
  let requestStatus: "pending" | "approved" | "denied" | null = null;
  let accessToken: string | null = null;
  
  if (params.code) {
    const request = await getQrRequestByCode(params.code);
    if (request) {
      requestStatus = request.status;
      accessToken = request.temporary_access_token || null;
    }
  }

  return (
    <RequestStatusChecker
      code={params.code || ""}
      initialStatus={requestStatus}
      initialAccessToken={accessToken}
      clientIp={clientIp}
    />
  );
}

