"use client";

import { useState } from "react";
import Link from "next/link";
import { createBookingAction } from "@/app/actions/booking";

interface BookFormProps {
  businessId: string;
  serviceId: string;
  customerId: string;
  startAt: string;
  businessSlug: string;
  businessName: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  formattedTime: string;
}

export default function BookForm({
  businessId,
  serviceId,
  customerId,
  startAt,
  businessSlug,
  businessName,
  serviceName,
  price,
  durationMinutes,
  formattedTime,
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

  if (confirmedBookingId) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-8 text-center shadow-sm dark:border-green-900/60 dark:bg-green-950/30">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-green-900 dark:text-green-100">
          Booking Confirmed!
        </h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Your appointment for <span className="font-semibold">{serviceName}</span> with{" "}
          <span className="font-semibold">{businessName}</span> has been confirmed.
        </p>
        <div className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-xs font-mono text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300 border border-green-200 dark:border-green-800">
          Booking ID: {confirmedBookingId}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/customer"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            View Dashboard
          </Link>
          <Link
            href={`/${businessSlug}`}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Book Another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
          <div className="mt-3">
            <Link
              href={`/${businessSlug}`}
              className="inline-block text-xs font-semibold underline hover:text-red-900 dark:hover:text-red-100"
            >
              Return to available slots
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Reservation Summary
        </h3>
        <dl className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
          <div className="py-3 flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Business</dt>
            <dd className="font-semibold text-gray-900 dark:text-gray-100">
              {businessName}
            </dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Service</dt>
            <dd className="font-semibold text-gray-900 dark:text-gray-100">
              {serviceName} ({durationMinutes} min)
            </dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Time</dt>
            <dd className="font-semibold text-blue-600 dark:text-blue-400">
              {formattedTime}
            </dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Total Price</dt>
            <dd className="font-extrabold text-gray-900 dark:text-gray-100">
              ${price.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${businessSlug}`}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "Confirming..." : "Confirm & Book Now"}
        </button>
      </div>
    </form>
  );
}
