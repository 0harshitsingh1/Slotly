"use client";

import { useActionState } from "react";
import { createBusinessAction, type BusinessActionState } from "@/app/actions/business";
import { TIMEZONES } from "@/lib/schemas/business";

const initialState: BusinessActionState = { success: false };

export function CreateBusinessForm() {
  const [state, formAction, isPending] = useActionState(
    createBusinessAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <div
          className={`rounded-md p-3 text-sm ${
            state.success
              ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
              : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Joe's Salon"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        {state.errors?.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
          <span className="ml-1 text-xs text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          placeholder="Tell customers what you offer…"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        {state.errors?.description && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Timezone <span className="text-red-500">*</span>
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue="UTC"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {state.errors?.timezone && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {state.errors.timezone[0]}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Your business slug will be auto-generated from the name.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {isPending ? "Creating…" : "Create Business"}
      </button>
    </form>
  );
}
