"use client";

import { useState } from "react";
import Link from "next/link";
import { HiDocumentArrowDown, HiEye, HiChevronDown, HiChevronRight } from "react-icons/hi2";
import type { DocumentUploadRecord } from "@/types";
import { documentCategories } from "@/data/categories";
import { FileViewer } from "./FileViewer";

interface DocumentsByCategoryProps {
  documents: DocumentUploadRecord[];
  accessToken?: string;
}

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

export function DocumentsByCategory({ documents, accessToken }: DocumentsByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(
    new Set()
  );
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Group documents by category and subcategory
  const groupedByCategory = documents.reduce<
    Record<
      string,
      Record<string, DocumentUploadRecord[]>
    >
  >((acc, doc) => {
    const categoryId = doc.category_id || "unknown";
    const subcategoryCode = doc.subcategory_code || "unknown";

    if (!acc[categoryId]) {
      acc[categoryId] = {};
    }
    if (!acc[categoryId][subcategoryCode]) {
      acc[categoryId][subcategoryCode] = [];
    }
    acc[categoryId][subcategoryCode].push(doc);
    return acc;
  }, {});

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (key: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Sort categories by their ID (numeric order)
  const sortedCategories = documentCategories
    .filter((cat) => groupedByCategory[cat.id])
    .sort((a, b) => {
      const numA = parseInt(a.id) || 0;
      const numB = parseInt(b.id) || 0;
      return numA - numB;
    });

  if (sortedCategories.length === 0) {
    return (
      <p className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-slate-600">
        No documents have been published yet. Please check back shortly after the
        administrator uploads new records.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sortedCategories.map((category) => {
        const categoryDocs = groupedByCategory[category.id];
        const isCategoryExpanded = expandedCategories.has(category.id);
        const totalDocsInCategory = Object.values(categoryDocs).reduce(
          (sum, docs) => sum + docs.length,
          0
        );

        return (
          <div
            key={category.id}
            className="rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_30px_90px_rgba(15,23,42,0.08)] overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition"
            >
              <div className="flex items-center gap-4">
                {isCategoryExpanded ? (
                  <HiChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <HiChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {category.id} - {category.label}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mt-1">
                    {totalDocsInCategory} document{totalDocsInCategory !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </button>

            {isCategoryExpanded && (
              <div className="border-t border-slate-200 bg-slate-50/30">
                {category.subcategories
                  .filter((subcat) => categoryDocs[subcat.code])
                  .map((subcategory) => {
                    const subcategoryDocs = categoryDocs[subcategory.code];
                    const subcategoryKey = `${category.id}-${subcategory.code}`;
                    const isSubcategoryExpanded = expandedSubcategories.has(
                      subcategoryKey
                    );

                    // Group documents by year within subcategory
                    const docsByYear = subcategoryDocs.reduce<
                      Record<string, DocumentUploadRecord[]>
                    >((acc, doc) => {
                      if (!acc[doc.year]) {
                        acc[doc.year] = [];
                      }
                      acc[doc.year].push(doc);
                      return acc;
                    }, {});

                    const sortedYears = Object.keys(docsByYear).sort(
                      (a, b) => parseInt(b) - parseInt(a)
                    );

                    return (
                      <div
                        key={subcategory.code}
                        className="border-b border-slate-200 last:border-b-0"
                      >
                        <button
                          onClick={() => toggleSubcategory(subcategoryKey)}
                          className="w-full flex items-center justify-between p-4 pl-12 text-left hover:bg-slate-50/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            {isSubcategoryExpanded ? (
                              <HiChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            ) : (
                              <HiChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            )}
                            <div>
                              <h3 className="text-base font-medium text-slate-800">
                                {subcategory.code} – {subcategory.label}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {subcategoryDocs.length} file
                                {subcategoryDocs.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </button>

                        {isSubcategoryExpanded && (
                          <div className="bg-white/50 pl-16 pr-4 pb-4">
                            <div className="space-y-3 pt-2">
                              {sortedYears.map((year) => (
                                <div key={year} className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-2">
                                    Year {year}
                                  </p>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {docsByYear[year].map((document) => (
                                      <article
                                        key={document.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-slate-900 truncate">
                                            {document.file_name}
                                          </p>
                                          <p className="text-xs text-slate-500 mt-0.5">
                                            {year}
                                          </p>
                                        </div>
                                        <div className="ml-3 flex-shrink-0 flex items-center gap-2">
                                          <button
                                            onClick={() =>
                                              setViewingFile({
                                                url: document.r2_url,
                                                name: document.file_name,
                                              })
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                                          >
                                            <HiEye className="h-3.5 w-3.5" />
                                            View
                                          </button>
                                          <Link
                                            href={document.r2_url}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <HiDocumentArrowDown className="h-3.5 w-3.5" />
                                            Download
                                          </Link>
                                        </div>
                                      </article>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.url}
          fileName={viewingFile.name}
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}

