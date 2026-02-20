"use client";

import { useState } from "react";
import { HiQrCode, HiCheckCircle, HiClock, HiTrash, HiXCircle } from "react-icons/hi2";
import { ApproveRequestButton } from "@/components/admin/ApproveRequestButton";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import type { QrRequestRecord } from "@/types";

interface AdminRequestsClientProps {
    requests: QrRequestRecord[];
}

export function AdminRequestsClient({ requests }: AdminRequestsClientProps) {
    const t = useTranslations('admin');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === requests.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(requests.map(r => r.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;

        const count = selectedIds.size;
        if (!confirm(`Are you sure you want to delete ${count} request${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedIds).map(id =>
                fetch(`/api/admin/delete-qr-request?id=${id}`, { method: "DELETE" })
            );

            await Promise.all(deletePromises);
            window.location.reload();
        } catch (error) {
            console.error("Error deleting requests:", error);
            alert("Failed to delete some requests. Please try again.");
            setIsDeleting(false);
        }
    };

    const handleClearAll = async () => {
        if (requests.length === 0) return;

        if (!confirm(`Are you sure you want to delete ALL ${requests.length} requests? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const deletePromises = requests.map(request =>
                fetch(`/api/admin/delete-qr-request?id=${request.id}`, { method: "DELETE" })
            );

            await Promise.all(deletePromises);
            window.location.reload();
        } catch (error) {
            console.error("Error clearing all requests:", error);
            alert("Failed to clear all requests. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Requests List */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xl"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{t('recentRequests')}</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {t('totalSelected', { total: requests.length, selected: selectedIds.size })}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {requests.length > 0 && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleSelectAll}
                                    className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    {selectedIds.size === requests.length ? t('deselectAll') : t('selectAll')}
                                </motion.button>

                                {selectedIds.size > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleDeleteSelected}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 border-2 border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-50"
                                    >
                                        <HiTrash className="h-4 w-4" />
                                        {t('deleteSelected', { count: selectedIds.size })}
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleClearAll}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-red-700 hover:to-red-800 hover:shadow-xl disabled:opacity-50"
                                >
                                    <HiTrash className="h-4 w-4" />
                                    {t('clearAll')}
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                            <HiQrCode className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-sm font-medium text-slate-500">{t('noRequestsYet')}</p>
                        </div>
                    ) : (
                        requests.map((request, idx) => {
                            const isSelected = selectedIds.has(request.id);

                            return (
                                <motion.article
                                    key={request.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group flex flex-col gap-4 rounded-2xl border-2 p-6 transition-all ${isSelected
                                        ? 'border-blue-400 bg-blue-50/50 shadow-md'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(request.id)}
                                            className="mt-1 h-5 w-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${request.status === "approved"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : request.status === "denied"
                                                                ? "bg-red-50 text-red-600"
                                                                : "bg-amber-50 text-amber-600"
                                                            }`}>
                                                            {request.status === "approved" ? (
                                                                <HiCheckCircle className="h-5 w-5" />
                                                            ) : request.status === "denied" ? (
                                                                <HiXCircle className="h-5 w-5" />
                                                            ) : (
                                                                <HiClock className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <p className="text-lg font-bold text-slate-900 font-mono">
                                                            {request.code}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-500 ml-[52px]">
                                                        {request.ip_address ?? t('ipUnknown')} • {new Date(request.created_at).toLocaleString()}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${request.status === "approved"
                                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                        : request.status === "denied"
                                                            ? "bg-red-100 text-red-700 border border-red-200"
                                                            : "bg-amber-100 text-amber-700 border border-amber-200"
                                                        }`}
                                                >
                                                    {request.status === "approved" ? (
                                                        <HiCheckCircle className="h-3.5 w-3.5" />
                                                    ) : request.status === "denied" ? (
                                                        <HiXCircle className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <HiClock className="h-3.5 w-3.5" />
                                                    )}
                                                    {t(request.status) || request.status}
                                                </span>
                                            </div>

                                            {request.status === "pending" && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <ApproveRequestButton requestId={request.id} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })
                    )}
                </div>
            </motion.section>
        </div>
    );
}
