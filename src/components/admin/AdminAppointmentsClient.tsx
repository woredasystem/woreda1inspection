"use client";

import { useState } from "react";
import { HiCalendar, HiClock, HiUser, HiCheckCircle, HiXCircle, HiArrowPath, HiDocumentText } from "react-icons/hi2";
import { useTranslations } from "next-intl";
import { parseEthiopianDate, getEthiopianDateWithMonthName } from "@/lib/ethiopianCalendar";
import { formatTime12Hour } from "@/lib/timeFormat";
import { TimeInput12Hour } from "@/components/TimeInput12Hour";
import { motion } from "framer-motion";
import type { AppointmentRecord } from "@/types";

interface AdminAppointmentsClientProps {
  appointments: AppointmentRecord[];
}

export function AdminAppointmentsClient({ appointments: initialAppointments }: AdminAppointmentsClientProps) {
  const t = useTranslations('admin');
  const [appointments, setAppointments] = useState(initialAppointments);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<{
    appointment: AppointmentRecord;
    action: "accept" | "reject" | "reschedule";
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [rescheduledDate, setRescheduledDate] = useState("");
  const [rescheduledTime, setRescheduledTime] = useState("");

  const handleAction = async () => {
    if (!showActionModal) return;

    const { appointment, action } = showActionModal;
    setActionLoading(appointment.id);

    try {
      const body: any = {
        appointmentId: appointment.id,
        reason: actionReason || undefined,
      };

      if (action === "reschedule") {
        if (!rescheduledDate) {
          alert(t('provideRescheduledDate') || "Please provide a rescheduled date");
          setActionLoading(null);
          return;
        }
        body.rescheduledDateEthiopian = rescheduledDate;
        body.rescheduledTime = rescheduledTime || undefined;
      }

      const response = await fetch(`/api/admin/appointments/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('failedToUpdateAppointment') || "Failed to update appointment");
      }

      // Update the appointment in the list
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointment.id
            ? {
              ...apt,
              status: action === "accept" ? "accepted" : action === "reject" ? "rejected" : "rescheduled",
              admin_reason: actionReason || undefined,
              rescheduled_date_ethiopian: action === "reschedule" ? rescheduledDate : undefined,
              rescheduled_time: action === "reschedule" ? rescheduledTime : undefined,
            }
            : apt
        )
      );

      setShowActionModal(null);
      setActionReason("");
      setRescheduledDate("");
      setRescheduledTime("");
    } catch (error) {
      alert(error instanceof Error ? error.message : t('unknownError'));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-blue-100 text-blue-800 border-blue-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      rescheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {t(status)}
      </span>
    );
  };

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center border border-slate-200 shadow-lg">
        <HiCalendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 text-lg">{t('noAppointmentsFound')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment, idx) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-white p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{appointment.requester_name}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm font-mono text-slate-500">{t('requestCode')}: {appointment.unique_code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <HiDocumentText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500">{t('summary')}</p>
                      <p className="font-medium text-slate-900">{appointment.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <HiCalendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500">{t('requestedDate')}</p>
                      <p className="font-medium text-slate-900">
                        {getEthiopianDateWithMonthName(parseEthiopianDate(appointment.requested_date_ethiopian))}
                      </p>
                    </div>
                  </div>

                  {appointment.requested_time && (
                    <div className="flex items-start gap-2">
                      <HiClock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">{t('requestedTime')}</p>
                        <p className="font-medium text-slate-900">{formatTime12Hour(appointment.requested_time)}</p>
                      </div>
                    </div>
                  )}

                  {(appointment.requester_email || appointment.requester_phone) && (
                    <div className="flex items-start gap-2">
                      <HiUser className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">{t('contactInfo')}</p>
                        <p className="font-medium text-slate-900">
                          {appointment.requester_email || appointment.requester_phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.status === "rescheduled" && appointment.rescheduled_date_ethiopian && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                    <p className="text-sm font-semibold text-yellow-900 mb-1">{t('rescheduledTo')}:</p>
                    <p className="text-sm text-yellow-800">
                      {getEthiopianDateWithMonthName(parseEthiopianDate(appointment.rescheduled_date_ethiopian))}
                      {appointment.rescheduled_time && ` ${t('at') || 'at'} ${formatTime12Hour(appointment.rescheduled_time)}`}
                    </p>
                  </div>
                )}

                {appointment.admin_reason && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900 mb-1">{t('adminNote')}:</p>
                    <p className="text-sm text-slate-700">{appointment.admin_reason}</p>
                  </div>
                )}
              </div>

              {appointment.status === "pending" && (
                <div className="flex flex-col gap-2 md:min-w-[200px]">
                  <button
                    onClick={() => setShowActionModal({ appointment, action: "accept" })}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700"
                  >
                    <HiCheckCircle className="w-4 h-4" />
                    {t('accept')}
                  </button>
                  <button
                    onClick={() => setShowActionModal({ appointment, action: "reject" })}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                  >
                    <HiXCircle className="w-4 h-4" />
                    {t('reject')}
                  </button>
                  <button
                    onClick={() => setShowActionModal({ appointment, action: "reschedule" })}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-yellow-700"
                  >
                    <HiArrowPath className="w-4 h-4" />
                    {t('reschedule')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {showActionModal.action === "accept" && t('acceptAppointment')}
              {showActionModal.action === "reject" && t('rejectAppointment')}
              {showActionModal.action === "reschedule" && t('rescheduleAppointment')}
            </h3>

            {showActionModal.action === "reschedule" && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('newDateEthiopian')} *
                  </label>
                  <input
                    type="text"
                    value={rescheduledDate}
                    onChange={(e) => setRescheduledDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    pattern="\d{2}/\d{2}/\d{4}"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('newTime')}
                  </label>
                  <TimeInput12Hour
                    value={rescheduledTime}
                    onChange={(value) => setRescheduledTime(value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t('reasonNote')}
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/20 outline-none resize-none"
                placeholder={t('addReasonPlaceholder')}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionReason("");
                  setRescheduledDate("");
                  setRescheduledTime("");
                }}
                className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t('close')}
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading === showActionModal.appointment.id}
                className="flex-1 rounded-lg bg-[#4169E1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3557c7] disabled:opacity-50"
              >
                {actionLoading === showActionModal.appointment.id ? t('processing') : t('confirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

