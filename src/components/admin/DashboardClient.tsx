"use client";

import Link from "next/link";
import Image from "next/image";
import { HiQrCode, HiDocumentArrowUp, HiDocumentText, HiCheckCircle, HiClock, HiShieldCheck, HiArrowRight, HiXCircle } from "react-icons/hi2";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { QrRequestRecord } from "@/types";
import { approveRequestAction } from "@/lib/adminActions";

interface DashboardClientProps {
  pendingCount: number;
  approvedCount: number;
  deniedCount: number;
  totalDocuments: number;
  totalRequests: number;
  filteredRequests: QrRequestRecord[];
}


export function DashboardClient({
  pendingCount,
  approvedCount,
  deniedCount,
  totalDocuments,
  totalRequests,
  filteredRequests,
}: DashboardClientProps) {
  const t = useTranslations('admin');

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Hero Welcome Section with Image */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-2xl" style={{
        backgroundImage: `url('/herobg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/60" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 mb-6 border border-white/30">
              <HiShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('administrator')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              {t('dashboardWelcome')}
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              {t('dashboardDescription')}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-blue-100">{t('systemOnline')}</span>
              </div>
            </div>
          </div>

          {/* Image/Visual Element */}
          <div className="hidden md:block relative">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl backdrop-blur-sm border border-white/20 p-8">
                <div className="h-full w-full bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 overflow-hidden">
                      <Image
                        src="/logo.jpg"
                        alt="Logo"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/30 rounded-full w-32 mx-auto" />
                      <div className="h-2 bg-white/20 rounded-full w-24 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <HiClock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">{pendingCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('pending')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <HiCheckCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">{approvedCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('approved')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                <HiXCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">{deniedCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('denied')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <HiDocumentText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">{totalDocuments}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('totalDocuments')}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests - Takes 2 columns */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('recentRequests')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('recentRequestsSubtitle')}</p>
            </div>
            <Link
              href="/admin/requests"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('viewAll')}
              <HiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <HiQrCode className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-500">{t('noRecentRequests')}</p>
                <p className="text-xs text-slate-400 mt-2">{t('noRecentRequestsSubtitle')}</p>
              </div>
            ) : (
              filteredRequests.map((request, idx) => (
                <motion.article
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
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
                        <div>
                          <p className="text-lg font-bold text-slate-900 font-mono">
                            {request.code}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${request.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : request.status === "denied"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {t(request.status) || request.status}
                    </span>
                  </div>

                  {request.status === "pending" && (
                    <form action={approveRequestAction} className="mt-4 pt-4 border-t border-slate-100">
                      <input type="hidden" name="requestId" value={request.id} />
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                      >
                        <HiCheckCircle className="h-5 w-5" />
                        {t('approveAccess')}
                      </button>
                    </form>
                  )}
                </motion.article>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions Sidebar */}
        <aside className="space-y-6">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{t('quickActions')}</h2>
            <div className="space-y-3">
              <Link
                href="/admin/upload"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border border-indigo-100 hover:shadow-lg hover:border-indigo-200 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <HiDocumentArrowUp className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{t('uploadDocument')}</h3>
                  <p className="text-xs text-slate-500">{t('uploadDocumentSubtitle')}</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/documents"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <HiDocumentText className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{t('viewDocuments')}</h3>
                  <p className="text-xs text-slate-500">{t('viewDocumentsSubtitle')}</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/qr-generator"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100 hover:shadow-lg hover:border-emerald-200 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <HiQrCode className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{t('generateQR')}</h3>
                  <p className="text-xs text-slate-500">{t('generateQRSubtitle')}</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </section>

          {/* System Status Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t('systemStatus')}</h3>
                <p className="text-xs text-slate-500">{t('allSystemsOperational')}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t('database')}</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('online')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t('storage')}</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('online')}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

