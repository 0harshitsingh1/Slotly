"use client";

import { useTransition } from "react";
import { cancelCustomerBookingAction } from "@/app/actions/booking";

interface CancelCustomerBookingButtonProps {
  bookingId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export default function CancelCustomerBookingButton({
  bookingId,
  status,
}: CancelCustomerBookingButtonProps) {
  const [isPending, startTransition] = useTransition();

  const isCancellable = status === "PENDING" || status === "CONFIRMED";

  if (!isCancellable) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {status === "CANCELLED" ? "Cancelled" : "Completed"}
      </span>
    );
  }

  const handleCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    const formData = new FormData();
    formData.append("bookingId", bookingId);

    startTransition(async () => {
      await cancelCustomerBookingAction(formData);
    });
  };

  return (
    <form onSubmit={handleCancel}>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
      >
        {isPending ? "Cancelling..." : "Cancel Reservation"}
      </button>
    </form>
  );
}
