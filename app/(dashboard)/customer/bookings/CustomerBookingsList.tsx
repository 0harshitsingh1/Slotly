"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import CancelCustomerBookingButton from "./CancelCustomerBookingButton";
import CustomerBookingTime from "./CustomerBookingTime";

export interface SerializedCustomerBooking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  start_at: string;
  end_at: string;
  business: {
    name: string;
    slug: string;
    timezone: string;
  };
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

interface CustomerBookingsListProps {
  bookings: SerializedCustomerBooking[];
}

export type FilterTab = "all" | "upcoming" | "past" | "cancelled";

import { Ticket } from "lucide-react";

export function CustomerBookingsList({ bookings }: CustomerBookingsListProps) {
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

      {/* Bookings Card List */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((booking) => {
            const isCancelled = booking.status === "CANCELLED";
            const isPast = new Date(booking.end_at) < now;

            return (
              <Card
                key={booking.id}
                hoverable
                className={`p-5 transition-all ${
                  isCancelled
                    ? "opacity-75 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80"
                    : isPast
                    ? "opacity-90 bg-white dark:bg-slate-900"
                    : "bg-white border-slate-200/90 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/${booking.business.slug}`}
                        className="font-heading font-extrabold text-base text-slate-900 hover:text-brand-600 hover:underline dark:text-white dark:hover:text-brand-400"
                      >
                        {booking.business.name}
                      </Link>
                      <Badge status={booking.status} />
                    </div>

                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {booking.service.name} ({booking.service.duration_minutes} min)
                    </p>

                    <CustomerBookingTime
                      startAt={booking.start_at}
                      endAt={booking.end_at}
                      businessTimezone={booking.business.timezone}
                    />

                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      Price: ₹{booking.service.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="self-start sm:self-center shrink-0">
                    <CancelCustomerBookingButton
                      bookingId={booking.id}
                      status={booking.status}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <div className="space-y-2">
            <Ticket className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              No bookings found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no appointments matching the selected filter ({activeTab}).
            </p>
            <div className="pt-2">
              <Link
                href="/businesses"
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Browse & Book Services →
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
