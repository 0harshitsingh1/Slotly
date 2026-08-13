"use client";

import { useTransition } from "react";
import { cancelOwnerBookingAction } from "@/app/actions/booking";

interface CancelBookingButtonProps {
  bookingId: string;
  isCancelled: boolean;
}

export default function CancelBookingButton({
  bookingId,
  isCancelled,
}: CancelBookingButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (isCancelled) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Cancelled
      </span>
    );
  }

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

  return (
    <form onSubmit={handleCancel}>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
      >
        {isPending ? "Cancelling..." : "Cancel Booking"}
      </button>
    </form>
  );
}
