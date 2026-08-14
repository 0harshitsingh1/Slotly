"use client";

import { useState } from "react";
import { saveWeeklyAvailabilityAction } from "@/app/actions/availability";

interface AvailabilityItem {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface WeeklyAvailabilityFormProps {
  initialAvailability: AvailabilityItem[];
}

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

export default function WeeklyAvailabilityForm({
  initialAvailability,
}: WeeklyAvailabilityFormProps) {
  // Map initial availability into state for days 0-6
  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((day) => {
      const existing = initialAvailability.find(
        (a) => a.day_of_week === day.id
      );
      return {
        day_of_week: day.id,
        is_open: Boolean(existing),
        start_time: existing?.start_time || "09:00",
        end_time: existing?.end_time || "17:00",
      };
    });
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggle = (dayId: number, is_open: boolean) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === dayId ? { ...item, is_open } : item
      )
    );
  };

  const handleTimeChange = (
    dayId: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === dayId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await saveWeeklyAvailabilityAction({
      schedule: schedule.map((item) => ({
        day_of_week: item.day_of_week,
        is_open: item.is_open,
        start_time: item.is_open ? item.start_time : null,
        end_time: item.is_open ? item.end_time : null,
      })),
    });

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Schedule updated successfully!" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update schedule." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Weekly Recurring Schedule
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Set default operating hours for each day of the week.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {DAYS.map((day) => {
          const dayData = schedule.find((s) => s.day_of_week === day.id)!;

          return (
            <div
              key={day.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3"
            >
              {/* Day Toggle */}
              <div className="flex items-center space-x-3 w-40">
                <input
                  id={`day-toggle-${day.id}`}
                  type="checkbox"
                  checked={dayData.is_open}
                  onChange={(e) => handleToggle(day.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor={`day-toggle-${day.id}`}
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  {day.name}
                </label>
              </div>

              {/* Status & Operating Hours Input */}
              {dayData.is_open ? (
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="sr-only">Start Time</label>
                    <input
                      type="time"
                      value={dayData.start_time}
                      onChange={(e) =>
                        handleTimeChange(day.id, "start_time", e.target.value)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <span className="text-xs text-gray-400">to</span>
                  <div className="space-y-1">
                    <label className="sr-only">End Time</label>
                    <input
                      type="time"
                      value={dayData.end_time}
                      onChange={(e) =>
                        handleTimeChange(day.id, "end_time", e.target.value)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                  Closed
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "Saving Schedule..." : "Save Weekly Availability"}
        </button>
      </div>
    </form>
  );
}
