"use client";

import { useActionState, useState } from "react";
import { createBusinessAction, type BusinessActionState } from "@/app/actions/business";
import { TIMEZONES } from "@/lib/schemas/business";

const initialState: BusinessActionState = { success: false };

export function CreateBusinessForm() {
  const [state, formAction, isPending] = useActionState(
    createBusinessAction,
    initialState
  );

  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError(`Unable to retrieve location: ${error.message}`);
      }
    );
  };

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
      </div>

      {/* Location (Latitude & Longitude) */}
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
            Location Coordinates <span className="text-gray-400 font-normal lowercase">(optional, for &quot;Near me&quot; search)</span>
          </label>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
          >
            {geoLoading ? "Detecting…" : "📍 Detect Location"}
          </button>
        </div>

        {geoError && (
          <p className="text-xs text-red-600 dark:text-red-400">{geoError}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="latitude"
              className="block text-xs text-gray-500 dark:text-gray-400"
            >
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 40.7128"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="longitude"
              className="block text-xs text-gray-500 dark:text-gray-400"
            >
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. -74.0060"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
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
