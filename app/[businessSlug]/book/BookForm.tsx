"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBookingAction } from "@/app/actions/booking";
import { Spinner } from "@/components/ui/Spinner";

interface BookFormProps {
  businessId: string;
  serviceId: string;
  customerId: string;
  startAt: string;
  businessSlug: string;
  businessName: string;
  businessTimezone: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  formattedTime: string;
}

function BookingConfirmationTime({
  startAt,
  durationMinutes,
  businessTimezone,
}: {
  startAt: string;
  durationMinutes: number;
  businessTimezone: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  if (!mounted) {
    const fallbackDateStr = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: businessTimezone,
    }).format(startDate);

    const fallbackStartTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: businessTimezone,
    }).format(startDate);

    const fallbackEndTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: businessTimezone,
    }).format(endDate);

    return (
      <span>
        {fallbackDateStr} • {fallbackStartTime} - {fallbackEndTime} ({businessTimezone})
      </span>
    );
  }

  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || businessTimezone;

  const localDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);

  const localStartTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(startDate);

  const localEndTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(endDate);

  return (
    <span>
      {localDateStr} • {localStartTime} - {localEndTime} ({browserTimezone})
    </span>
  );
}

export default function BookForm({
  businessId,
  serviceId,
  customerId,
  startAt,
  businessSlug,
  businessName,
  businessTimezone,
  serviceName,
  price,
  durationMinutes,
}: BookFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createBookingAction({
      businessId,
      serviceId,
      customerId,
      startAt,
    });

    setLoading(false);

    if (result.success && result.bookingId) {
      setConfirmedBookingId(result.bookingId);
    } else {
      setError(result.message || "Failed to complete booking.");
    }
  };

  // State 2: Booking Confirmed Success View (Stitch Design)
  if (confirmedBookingId) {
    return (
      <div className="bg-[#161b22]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.18)] flex flex-col items-center text-center relative overflow-hidden space-y-6">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500" />

        {/* Animated Checkmark Icon Tile */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-300 shadow-[0_0_20px_rgba(160,120,255,0.3)] animate-pulse mb-1">
          <svg className="h-8 w-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-1">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 dark:text-white">
            Booking Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Your appointment has been successfully scheduled.
          </p>
        </div>

        {/* Reference ID Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-[#273647]/60 px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold text-slate-300">
          <span className="text-slate-400 uppercase">REF ID</span>
          <span className="font-mono text-brand-400 tracking-wider">#{confirmedBookingId.slice(-8)}</span>
        </div>

        {/* Reservation Details Bento Box */}
        <div className="w-full bg-[#122131]/90 rounded-2xl border border-white/10 p-5 overflow-hidden text-left space-y-4 shadow-md">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Business</span>
            <h3 className="font-heading font-extrabold text-slate-100 text-base sm:text-lg">
              {businessName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Service</span>
              <span className="font-extrabold text-slate-200 block text-sm">{serviceName}</span>
              <span className="text-slate-400">⏱️ {durationMinutes} min</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Total Paid</span>
              <span className="font-heading font-extrabold text-brand-400 text-sm block">₹{price.toFixed(2)}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold">
                ✓ Confirmed
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/10">
              <span className="text-slate-400 block font-medium">Date & Time</span>
              <span className="font-bold text-slate-100">
                <BookingConfirmationTime
                  startAt={startAt}
                  durationMinutes={durationMinutes}
                  businessTimezone={businessTimezone}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/customer" className="w-full">
            <button className="w-full rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-heading font-extrabold text-xs sm:text-sm py-3 px-6 transition-all duration-300 shadow-[0_0_20px_rgba(160,120,255,0.3)] flex items-center justify-center gap-2">
              <span>View Dashboard</span>
              <span>→</span>
            </button>
          </Link>
          <Link href={`/${businessSlug}`} className="w-full">
            <button className="w-full rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs sm:text-sm py-3 px-6 transition-all flex items-center justify-center gap-2">
              <span>Book Another</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // State 1: Review & Confirm Booking Form View (Stitch Design)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-950/40 p-4 text-xs font-semibold text-danger-300 space-y-2">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <div>
            <Link
              href={`/${businessSlug}`}
              className="inline-block font-semibold text-brand-400 hover:underline text-xs"
            >
              Return to available slots
            </Link>
          </div>
        </div>
      )}

      {/* Glassmorphic Reservation Summary Card */}
      <div className="bg-[#161b22]/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.18)] relative overflow-hidden space-y-6">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500" />

        <div className="space-y-1 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 dark:text-white">
            Confirm Booking
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Review reservation details below to complete your booking.
          </p>
        </div>

        {/* Bento Box Summary Details */}
        <div className="w-full bg-[#122131]/90 rounded-2xl border border-white/10 p-5 overflow-hidden space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business</span>
            <span className="font-heading font-extrabold text-slate-100 text-sm sm:text-base">{businessName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Service</span>
            <span className="font-heading font-extrabold text-slate-100 text-sm sm:text-base">
              {serviceName} ({durationMinutes} min)
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</span>
            <span className="font-bold text-brand-400 text-xs sm:text-sm text-right">
              <BookingConfirmationTime
                startAt={startAt}
                durationMinutes={durationMinutes}
                businessTimezone={businessTimezone}
              />
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Price</span>
            <span className="font-heading text-lg sm:text-xl font-extrabold text-brand-400">
              ₹{price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link href={`/${businessSlug}`} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-heading font-extrabold text-xs sm:text-sm py-3 px-6 transition-all"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-heading font-extrabold text-xs sm:text-sm py-3 px-8 transition-all duration-300 shadow-[0_0_20px_rgba(160,120,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span>Confirm &amp; Book Now</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
