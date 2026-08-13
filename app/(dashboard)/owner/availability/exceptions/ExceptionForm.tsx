"use client";

import { useState } from "react";
import { createAvailabilityExceptionAction, ExceptionActionState } from "@/app/actions/availability";

export default function ExceptionForm() {
  const [isClosed, setIsClosed] = useState(true);
  const [state, setState] = useState<ExceptionActionState>({ success: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setState({ success: false });

    const formData = new FormData(e.currentTarget);
    const result = await createAvailabilityExceptionAction({ success: false }, formData);

    setLoading(false);
    setState(result);

    if (result.success) {
      (e.target as HTMLFormElement).reset();
      setIsClosed(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Add Date Override / Exception
      </h2>

      {state.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            state.success
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Selector */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
            Target Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Fully Closed Toggle */}
        <div className="flex items-center space-x-3 sm:pt-6">
          <input
            id="is_closed"
            name="is_closed"
            type="checkbox"
            checked={isClosed}
            onChange={(e) => setIsClosed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
          />
          <label htmlFor="is_closed" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Mark business as <span className="font-bold text-red-600 dark:text-red-400">FULLY CLOSED</span> on this date
          </label>
        </div>
      </div>

      {/* Custom Start/End Times if NOT closed */}
      {!isClosed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <label htmlFor="start_time" className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
              Custom Open Time
            </label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              required={!isClosed}
              defaultValue="10:00"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="end_time" className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
              Custom Close Time
            </label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              required={!isClosed}
              defaultValue="14:00"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Save Exception"}
        </button>
      </div>
    </form>
  );
}
