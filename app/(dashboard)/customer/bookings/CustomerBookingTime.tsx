"use client";

import { useEffect, useState } from "react";

interface CustomerBookingTimeProps {
  startAt: string; // ISO string
  endAt: string;   // ISO string
  businessTimezone: string;
}

export default function CustomerBookingTime({
  startAt,
  endAt,
  businessTimezone,
}: CustomerBookingTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  // Initial SSR rendering fallback using business timezone
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
      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
        <span className="font-bold">{fallbackDateStr}</span> •{" "}
        <span className="font-semibold text-brand-600 dark:text-brand-400">
          {fallbackStartTime} - {fallbackEndTime}
        </span>{" "}
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">({businessTimezone})</span>
      </p>
    );
  }

  // Client-side rendering in customer's local browser timezone
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
    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
      <span className="font-bold">{localDateStr}</span> •{" "}
      <span className="font-semibold text-brand-600 dark:text-brand-400">
        {localStartTime} - {localEndTime}
      </span>{" "}
      <span className="text-slate-500 dark:text-slate-400 text-[11px]">({browserTimezone})</span>
    </p>
  );
}
