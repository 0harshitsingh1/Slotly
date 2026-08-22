"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import CancelBookingButton from "./CancelBookingButton";

export interface SerializedOwnerBooking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  start_at: string;
  end_at: string;
  customer: {
    name: string | null;
    email: string;
  };
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

interface OwnerBookingsListProps {
  bookings: SerializedOwnerBooking[];
  timezone: string;
}

export type FilterTab = "all" | "upcoming" | "past" | "cancelled";

function formatSlotTime(isoString: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

function formatDateHeader(isoString: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleDateString();
  }
}

export function OwnerBookingsList({ bookings, timezone }: OwnerBookingsListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.end_at) >= now && b.status !== "CANCELLED"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.end_at) < now && b.status !== "CANCELLED"
  );
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  const getFilteredBookings = () => {
    switch (activeTab) {
      case "upcoming":
        return upcomingBookings;
      case "past":
        return pastBookings;
      case "cancelled":
        return cancelledBookings;
      case "all":
      default:
        return bookings;
    }
  };

  const filteredList = getFilteredBookings();

  // Group filtered bookings by date label
  const groupedMap = new Map<string, SerializedOwnerBooking[]>();
  for (const b of filteredList) {
    const label = formatDateHeader(b.start_at, timezone);
    if (!groupedMap.has(label)) {
      groupedMap.set(label, []);
    }
    groupedMap.get(label)!.push(b);
  }
  const groupedEntries = Array.from(groupedMap.entries());

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All Bookings", count: bookings.length },
    { id: "upcoming", label: "Upcoming", count: upcomingBookings.length },
    { id: "past", label: "Past", count: pastBookings.length },
    { id: "cancelled", label: "Cancelled", count: cancelledBookings.length },
  ];

  return (
    <div className="space-y-6">
      {/* Filtering Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 dark:bg-brand-500"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings Display Grouped by Date */}
      {groupedEntries.length > 0 ? (
        <div className="space-y-5">
          {groupedEntries.map(([dateLabel, groupItems]) => (
            <Card key={dateLabel} className="p-5">
              <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3 flex items-center gap-2">
                <span>📅 {dateLabel}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({groupItems.length} slot{groupItems.length !== 1 ? "s" : ""})
                </span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {groupItems.map((booking) => {
                  const startTime = formatSlotTime(booking.start_at, timezone);
                  const endTime = formatSlotTime(booking.end_at, timezone);
                  const isCancelled = booking.status === "CANCELLED";

                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {booking.service.name}
                          </span>
                          <Badge status={booking.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Customer:{" "}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {booking.customer.name || booking.customer.email}
                          </span>{" "}
                          ({booking.customer.email})
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Time:{" "}
                          <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {startTime} - {endTime}
                          </span>{" "}
                          • Price: ₹{booking.service.price.toFixed(2)} ({booking.service.duration_minutes} min)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <CancelBookingButton
                          bookingId={booking.id}
                          isCancelled={isCancelled}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <div className="space-y-2">
            <span className="text-3xl">📑</span>
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              No bookings found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no customer reservations under the selected tab ({activeTab}).
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
