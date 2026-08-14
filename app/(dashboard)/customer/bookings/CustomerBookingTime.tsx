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

  // Business timezone formatted string (SSR safe fallback)
  const businessDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: businessTimezone,
  }).format(startDate);

  const businessStartTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: businessTimezone,
  }).format(startDate);

  const businessEndTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: businessTimezone,
  }).format(endDate);

  if (!mounted) {
    return (
      <div className="space-y-0.5">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{businessDateStr}</span> • {businessStartTime} - {businessEndTime} ({businessTimezone})
        </p>
      </div>
    );
  }

  // Client-side rendering in customer's local browser timezone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";

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

  const isDifferentTz = browserTimezone && browserTimezone !== businessTimezone;

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-700 dark:text-gray-300">
        <span className="font-bold">{localDateStr}</span> •{" "}
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {localStartTime} - {localEndTime}
        </span>{" "}
        <span className="text-gray-500 text-[11px]">(Your Timezone: {browserTimezone})</span>
      </p>
      {isDifferentTz && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Business Local: {businessStartTime} - {businessEndTime} ({businessTimezone})
        </p>
      )}
    </div>
  );
}
