"use client";

import { useTransition } from "react";
import { cancelOwnerBookingAction, completeOwnerBookingAction } from "@/app/actions/booking";

interface BookingActionButtonsProps {
  bookingId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  endAt: string;
}

export default function BookingActionButtons({
  bookingId,
  status,
  endAt,
}: BookingActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  if (status === "CANCELLED" || status === "COMPLETED") {
    return null; // Don't show buttons for final statuses
  }

  const isAppointmentOver = new Date() >= new Date(endAt);

  const handleCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    const formData = new FormData();
    formData.append("bookingId", bookingId);

    startTransition(async () => {
      await cancelOwnerBookingAction(formData);
    });
  };

  const handleComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Confirm this appointment was completed?")) {
      return;
    }
    const formData = new FormData();
    formData.append("bookingId", bookingId);

    startTransition(async () => {
      await completeOwnerBookingAction(formData);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <form onSubmit={handleComplete}>
        <button
          type="submit"
          disabled={isPending || !isAppointmentOver}
          title={!isAppointmentOver ? "Available after the appointment time ends" : "Mark as Completed"}
          className="rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/60"
        >
          {isPending ? "Processing..." : "Mark Completed"}
        </button>
      </form>

      <form onSubmit={handleCancel}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
        >
          {isPending ? "Processing..." : "Cancel"}
        </button>
      </form>
    </div>
  );
}
