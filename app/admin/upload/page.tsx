import { Metadata } from "next";
import { HiDocumentArrowUp } from "react-icons/hi2";
import { UploadForm } from "@/components/admin/UploadForm";

export const metadata: Metadata = {
  title: "Admin : Upload Documents",
  description: "Upload multiple documents to the system.",
};

export default function AdminUploadPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <HiDocumentArrowUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Upload Documents
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Upload multiple documents by selecting a category, subcategory, and year.
              You can select multiple files at once for batch upload.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <UploadForm />
      </section>
    </div>
  );
}

