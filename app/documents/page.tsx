import Link from "next/link";
import { HiLockClosed, HiQrCode, HiClock } from "react-icons/hi2";
import { validateTemporaryAccess } from "@/lib/access";
import { getDocumentsForWoreda } from "@/lib/uploads";
import { publicEnv } from "@/lib/env";
import { DocumentsByCategory } from "@/components/DocumentsByCategory";

const hasSupabaseServerConfig = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const metadata = {
  title: "Documents • Temporary Access",
  description:
    "View official category documents after receiving temporary access approval.",
};

export const dynamic = "force-dynamic";


interface DocumentsPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;
  
  if (!hasSupabaseServerConfig) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="flex flex-col gap-6 p-4 py-16">
          <h1 className="text-3xl font-semibold text-slate-900">
            Documents temporarily unavailable
          </h1>
          <p className="text-slate-600">
            The secure document feed requires server-side Supabase credentials
            (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`). Please define them
            in `.env.local` or your deployment environment before continuing.
          </p>
        </main>
      </div>
    );
  }

  if (!params.token) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="flex flex-col gap-6 p-4 py-16">
          <h1 className="text-3xl font-semibold text-slate-900">
            Documents Preview
          </h1>
          <p className="text-slate-600">
            This portal is restricted to approved temporary users. Please start
            the access flow via your QR code or wait for your administrator to
            share the secure link.
          </p>
          <Link
            href="/request-access"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <HiQrCode className="h-4 w-4" />
            Request Access
          </Link>
        </main>
      </div>
    );
  }

  const accessRecord = await validateTemporaryAccess(params.token);

  if (!accessRecord) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-16 lg:px-10">
          <h1 className="text-3xl font-semibold text-slate-900">
            Access expired or invalid
          </h1>
          <p className="text-slate-600">
            The temporary token appears to have expired. Please request a fresh
            QR approval from your administrator.
          </p>
          <Link
            href="/request-access"
            className="inline-flex w-fit items-center rounded-full border border-slate-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          >
            Request New Access
          </Link>
        </main>
      </div>
    );
  }

  const documents = await getDocumentsForWoreda(accessRecord.woreda_id);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex flex-col gap-8 p-4 py-16">
        <div className="flex items-center justify-between rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
              <HiLockClosed className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Authorized Reader
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                {publicEnv.NEXT_PUBLIC_WOREDA_NAME} Documents
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
            <HiClock className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
              Valid until {new Date(accessRecord.expires_at).toLocaleString()}
            </span>
          </div>
        </div>

        <DocumentsByCategory documents={documents} accessToken={params.token} />
      </main>
    </div>
  );
}

