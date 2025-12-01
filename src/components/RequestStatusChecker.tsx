"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiQrCode, HiClock, HiCheckCircle, HiXCircle, HiArrowRight } from "react-icons/hi2";
import Link from "next/link";

interface RequestStatusCheckerProps {
  code: string;
  initialStatus: "pending" | "approved" | "denied" | null;
  initialAccessToken: string | null;
  clientIp: string;
}

export function RequestStatusChecker({
  code,
  initialStatus,
  initialAccessToken,
  clientIp,
}: RequestStatusCheckerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "denied" | null>(initialStatus);
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken);
  const [isPolling, setIsPolling] = useState(initialStatus === "pending");
  const statusRef = useRef(status);
  
  // Keep ref in sync with state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!isPolling || !code) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/request-status?code=${encodeURIComponent(code)}`);
        if (!response.ok) {
          console.error("Failed to check status");
          return;
        }

        const data = await response.json();
        
        // Use ref to check current status without causing re-renders
        if (data.status && data.status !== statusRef.current) {
          setStatus(data.status);
          setAccessToken(data.accessToken);
          
          // Stop polling if approved or denied
          if (data.status === "approved" || data.status === "denied") {
            setIsPolling(false);
            // Refresh the page to show updated UI
            setTimeout(() => router.refresh(), 100);
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [code, isPolling, router]);

  const isApproved = status === "approved";
  const isDenied = status === "denied";
  const isPending = status === "pending" || status === null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex flex-col gap-8 p-4 py-16">
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/60 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <HiQrCode className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Temporary Access Flow
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {isApproved ? "Access Approved" : isDenied ? "Access Denied" : "Requesting temporary access…"}
            </p>
          </div>
        </div>

        <section className="rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isApproved ? "bg-emerald-50" : isDenied ? "bg-red-50" : "bg-amber-50"
            }`}>
              {isApproved ? (
                <HiCheckCircle className="h-6 w-6 text-emerald-600" />
              ) : isDenied ? (
                <HiXCircle className="h-6 w-6 text-red-600" />
              ) : (
                <HiClock className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isApproved ? "Access Approved" : isDenied ? "Access Denied" : "Access is under review"}
            </h2>
          </div>
          
          {isApproved ? (
            <>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                Your request has been approved! You now have temporary access to view documents. 
                This access is valid for up to two hours.
              </p>
              {accessToken && (
                <div className="mb-6">
                  <Link
                    href={`/documents?token=${accessToken}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <HiArrowRight className="h-4 w-4" />
                    View Documents
                  </Link>
                </div>
              )}
            </>
          ) : isDenied ? (
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Your access request has been denied. Please contact an administrator if you believe this is an error.
            </p>
          ) : (
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              The QR code was logged with IP <span className="font-semibold text-slate-900">{clientIp}</span>. An administrator will
              review the request and approve or deny it. Approved requests are
              valid for up to two hours.
              {isPolling && (
                <span className="ml-2 inline-block animate-pulse">⏳</span>
              )}
            </p>
          )}

          <dl className="mb-6 grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-slate-400">
                <HiQrCode className="h-3.5 w-3.5" />
                Request code
              </dt>
              <dd className="font-semibold text-slate-900">
                {code ?? "Awaiting QR"}
              </dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-slate-400">
                <HiCheckCircle className="h-3.5 w-3.5" />
                Status
              </dt>
              <dd className="font-semibold text-slate-900">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-700"
                    : isDenied
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {status || "pending"}
                </span>
              </dd>
            </div>
          </dl>

          {isPending && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
              <HiCheckCircle className="h-5 w-5 text-blue-600" />
              <p className="text-xs uppercase tracking-[0.4em] text-blue-700">
                You will receive a portal link once your request is approved.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

