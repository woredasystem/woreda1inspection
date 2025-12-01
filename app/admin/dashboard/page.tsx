import { Metadata } from "next";
import Link from "next/link";
import { HiQrCode, HiDocumentArrowUp, HiDocumentText, HiCheckCircle, HiClock } from "react-icons/hi2";
import { listRecentQrRequests, approveAccessRequest } from "@/lib/access";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin : Dashboard",
  description: "Monitor QR requests, approve access, and upload documents.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const recentRequests = await listRecentQrRequests();

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.5)]">
        <p className="text-xs uppercase tracking-[0.45em] text-slate-400">
          Logged in as administrator
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {publicEnv.NEXT_PUBLIC_WOREDA_NAME} Dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          Review incoming QR access requests, manage approved tokens, and upload
          documents directly to Cloudflare R2 with a secure metadata log.
        </p>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <HiQrCode className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              QR Access Requests
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {recentRequests.length} recent
          </p>
        </div>
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <article
              key={request.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {request.code}
                  </p>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    {request.ip_address ?? "IP Unknown"} ·{" "}
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                  request.status === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {request.status === "approved" ? (
                    <HiCheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <HiClock className="h-3.5 w-3.5" />
                  )}
                  {request.status}
                </span>
              </div>
              <form action={approveRequestAction} className="flex gap-3">
                <input type="hidden" name="requestId" value={request.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                >
                  <HiCheckCircle className="h-4 w-4" />
                  Approve
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <HiDocumentArrowUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Quick Actions
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/upload"
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 transition hover:border-indigo-300 hover:bg-indigo-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <HiDocumentArrowUp className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Upload Documents
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Upload multiple documents by category, subcategory, and year.
            </p>
          </Link>
          <Link
            href="/admin/documents"
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 transition hover:border-blue-300 hover:bg-blue-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <HiDocumentText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                View All Documents
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Browse and manage all uploaded documents by category.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

async function approveRequestAction(formData: FormData) {
  "use server";
  const requestId = formData.get("requestId")?.toString();
  if (!requestId) {
    throw new Error("Request ID is required.");
  }

  await approveAccessRequest(requestId);
}


