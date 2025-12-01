"use client";

import { FormEvent, useState, useMemo, useRef } from "react";
import { HiDocumentArrowUp, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { documentCategories } from "@/data/categories";

export function UploadForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = documentCategories.find((cat) => cat.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0) {
      setStatus("Please select at least one file.");
      setIsUploading(false);
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const file of files) {
        try {
          const uploadData = new FormData();
          uploadData.append("file", file);
          uploadData.append("category", formData.get("category") as string);
          uploadData.append("subcategory", formData.get("subcategory") as string);
          uploadData.append("year", formData.get("year") as string);

          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body: uploadData,
          });

          if (response.ok) {
            const result = await response.json().catch(() => ({}));
            successCount++;
          } else {
            errorCount++;
            try {
              const errorData = await response.json();
              errors.push(errorData.message || `Failed to upload ${file.name}`);
            } catch {
              errors.push(`Failed to upload ${file.name} (${response.status})`);
            }
          }
        } catch (fileError) {
          errorCount++;
          errors.push(`Error uploading ${file.name}: ${fileError instanceof Error ? fileError.message : "Unknown error"}`);
        }
      }

      if (errorCount === 0) {
        setStatus(`${successCount} file(s) uploaded successfully.`);
        if (formRef.current) {
          formRef.current.reset();
        }
        setSelectedCategory("");
      } else if (successCount > 0) {
        setStatus(`${successCount} uploaded, ${errorCount} failed. ${errors[0]}`);
      } else {
        setStatus(`Upload failed: ${errors[0] || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
    >
      <fieldset className="space-y-2 text-xs uppercase tracking-[0.4em] text-slate-400">
        <legend>Category</legend>
        <select
          name="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        >
          <option value="">Select Category</option>
          {documentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.id} - {category.label}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset className="space-y-2 text-xs uppercase tracking-[0.4em] text-slate-400">
        <legend>Subcategory</legend>
        <select
          name="subcategory"
          required
          disabled={!selectedCategory || availableSubcategories.length === 0}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Subcategory</option>
          {availableSubcategories.map((subcategory) => (
            <option key={subcategory.code} value={subcategory.code}>
              {subcategory.code} - {subcategory.label}
            </option>
          ))}
        </select>
      </fieldset>
      <label className="text-xs uppercase tracking-[0.4em] text-slate-400">
        Year
        <input
          type="text"
          name="year"
          placeholder="2025"
          required
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.4em] text-slate-400">
        Documents (Multiple files allowed)
        <input
          type="file"
          name="files"
          accept=".pdf,.doc,.docx,.xlsx,.xls,.odt"
          multiple
          required
          className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          You can select multiple files at once
        </p>
      </label>
      <button
        type="submit"
        disabled={isUploading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <HiDocumentArrowUp className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Documents"}
      </button>
      {status && (
        <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] ${
          status.includes("successfully")
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}>
          {status.includes("successfully") ? (
            <HiCheckCircle className="h-4 w-4" />
          ) : (
            <HiXCircle className="h-4 w-4" />
          )}
          {status}
        </div>
      )}
    </form>
  );
}


