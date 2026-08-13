"use client";

import { useActionState } from "react";
import { createServiceAction, type ServiceActionState } from "@/app/actions/service";

const initialState: ServiceActionState = { success: false };

export function AddServiceForm() {
  const [state, formAction, isPending] = useActionState(
    createServiceAction,
    initialState
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Add a New Service
      </h2>

      {state.message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            state.success
              ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
              : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Service Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Haircut & Style"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {state.errors?.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration_minutes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              required
              min={5}
              step={5}
              placeholder="60"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {state.errors?.duration_minutes && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {state.errors.duration_minutes[0]}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min={0}
              step={0.01}
              placeholder="45.00"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {state.errors?.price && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {state.errors.price[0]}
              </p>
            )}
          </div>

          {/* Buffer */}
          <div>
            <label
              htmlFor="buffer_minutes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Buffer Time (minutes)
              <span className="ml-1 text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="buffer_minutes"
              name="buffer_minutes"
              type="number"
              min={0}
              step={5}
              defaultValue={0}
              placeholder="0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {state.errors?.buffer_minutes && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {state.errors.buffer_minutes[0]}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Cleanup / preparation time added after this service.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isPending ? "Adding…" : "Add Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
