"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ServiceOption {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  buffer_minutes: number;
}

interface BookingControlsProps {
  services: ServiceOption[];
  selectedServiceId: string;
  selectedDate: string;
  businessSlug: string;
}

export default function BookingControls({
  services,
  selectedServiceId,
  selectedDate,
}: BookingControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleServiceChange = (serviceId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("service", serviceId);
    if (!params.has("date")) {
      params.set("date", selectedDate);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (dateStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);
    if (!params.has("service") && selectedServiceId) {
      params.set("service", selectedServiceId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {/* Service Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
          1. Select a Service
        </label>
        {services.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No services currently available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceChange(service.id)}
                  className={`flex flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-blue-500"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {service.name}
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        ₹{service.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Duration: {service.duration_minutes} min
                      {service.buffer_minutes > 0 &&
                        ` (${service.buffer_minutes} min buffer)`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Picker */}
      <div className="space-y-3">
        <label
          htmlFor="booking-date"
          className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          2. Select Date
        </label>
        <input
          id="booking-date"
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400"
        />
      </div>
    </div>
  );
}
