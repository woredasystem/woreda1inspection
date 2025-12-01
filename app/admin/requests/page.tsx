import { Metadata } from "next";
import { HiQrCode, HiCheckCircle, HiClock } from "react-icons/hi2";
import { listRecentQrRequests } from "@/lib/access";
import { ApproveRequestButton } from "@/components/admin/ApproveRequestButton";

export const metadata: Metadata = {
  title: "Admin : QR Requests",
  description: "Manage QR access requests.",
};

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const recentRequests = await listRecentQrRequests(50);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <HiQrCode className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              QR Access Requests
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Review and approve QR code access requests from users.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Requests
          </h2>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {recentRequests.length} total
          </p>
        </div>
        <div className="space-y-3">
          {recentRequests.length === 0 ? (
            <p className="text-center text-slate-600">No requests yet.</p>
          ) : (
            recentRequests.map((request) => (
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
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                      request.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {request.status === "approved" ? (
                      <HiCheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <HiClock className="h-3.5 w-3.5" />
                    )}
                    {request.status}
                  </span>
                </div>
                {request.status === "pending" && (
                  <ApproveRequestButton requestId={request.id} />
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

