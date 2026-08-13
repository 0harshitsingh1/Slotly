"use client";

import { useTransition } from "react";
import { deleteAvailabilityExceptionAction } from "@/app/actions/availability";

interface DeleteExceptionButtonProps {
  exceptionId: string;
}

export default function DeleteExceptionButton({ exceptionId }: DeleteExceptionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to remove this schedule exception?")) {
      return;
    }
    const formData = new FormData();
    formData.append("exceptionId", exceptionId);

    startTransition(async () => {
      await deleteAvailabilityExceptionAction(formData);
    });
  };

  return (
    <form onSubmit={handleDelete}>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
      >
        {isPending ? "Removing..." : "Delete Exception"}
      </button>
    </form>
  );
}
