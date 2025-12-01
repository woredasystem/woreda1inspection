"use client";

import { useState } from "react";
import { documentCategories } from "@/data/categories";
import { HiChevronDown, HiChevronRight, HiFolder, HiDocumentText } from "react-icons/hi2";

interface DocumentSidebarProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategorySelect?: (categoryId: string, subcategoryCode: string) => void;
}

export function DocumentSidebar({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
}: DocumentSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory] : [])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-slate-200 bg-white/50">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
        <p className="mt-1 text-xs text-slate-500">
          Browse documents by category
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {documentCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = selectedCategory === category.id;

            return (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {isExpanded ? (
                    <HiChevronDown className="h-4 w-4" />
                  ) : (
                    <HiChevronRight className="h-4 w-4" />
                  )}
                  <HiFolder className="h-4 w-4" />
                  <span className="flex-1">
                    {category.id} - {category.label}
                  </span>
                </button>
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-2">
                    {category.subcategories.map((subcategory) => {
                      const isSubSelected =
                        selectedCategory === category.id &&
                        selectedSubcategory === subcategory.code;

                      return (
                        <button
                          key={subcategory.code}
                          onClick={() =>
                            onCategorySelect?.(category.id, subcategory.code)
                          }
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition ${
                            isSubSelected
                              ? "bg-blue-50 font-semibold text-blue-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <HiDocumentText className="h-3.5 w-3.5" />
                          <span className="flex-1">
                            {subcategory.code} - {subcategory.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

