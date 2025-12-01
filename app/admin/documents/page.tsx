import { Metadata } from "next";
import Link from "next/link";
import { HiDocumentText, HiDocumentArrowDown } from "react-icons/hi2";
import { getDocumentsForWoreda } from "@/lib/uploads";
import { documentCategories } from "@/data/categories";
import { publicEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const metadata: Metadata = {
  title: "Admin : View Documents",
  description: "Browse and manage all uploaded documents.",
};

export const dynamic = "force-dynamic";

const findCategoryLabel = (categoryId?: string): string => {
  const category = documentCategories.find((item) => item.id === categoryId);
  return category?.label ?? "General";
};

const findSubcategoryLabel = (
  categoryId?: string,
  subcategoryCode?: string
): string => {
  const category = documentCategories.find((item) => item.id === categoryId);
  const subcategory = category?.subcategories.find(
    (child) => child.code === subcategoryCode
  );
  return subcategory?.label ?? "Document";
};

const groupByCategory = (documents: any[]) => {
  return documents.reduce<Record<string, any[]>>((acc, doc) => {
    const key = `${doc.category_id}-${doc.subcategory_code}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(doc);
    return acc;
  }, {});
};

import { getDocumentsForCurrentWoreda } from "@/lib/uploads";

export default async function AdminDocumentsPage() {
  const documents = await getDocumentsForCurrentWoreda();

  const grouped = groupByCategory(documents || []);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <HiDocumentText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              All Documents
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Browse all uploaded documents organized by category and subcategory.
            </p>
          </div>
        </div>
      </section>

      {Object.keys(grouped).length === 0 ? (
        <section className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <p className="text-center text-slate-600">
            No documents have been uploaded yet.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, items]) => {
            const [categoryId, subcategoryCode] = key.split("-");
            return (
              <section
                key={key}
                className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {findCategoryLabel(categoryId)}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {findSubcategoryLabel(categoryId, subcategoryCode)}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    {items.length} file(s)
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((document) => (
                    <article
                      key={document.id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {document.file_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Year: {document.year}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={document.r2_url}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-700 transition hover:text-slate-900"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <HiDocumentArrowDown className="h-4 w-4" />
                        Download
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

