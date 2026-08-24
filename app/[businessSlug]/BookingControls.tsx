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
    <div className="space-y-5">
      {/* Service Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          1. Select Service
        </label>
        {services.length === 0 ? (
          <p className="text-xs italic text-slate-500">
            No services currently available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceChange(service.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-brand-400 bg-brand-500/15 ring-2 ring-brand-400/20 text-white"
                      : "border-white/10 bg-[#273647]/70 hover:border-white/20 text-slate-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-heading text-xs sm:text-sm font-extrabold block text-slate-100">
                      {service.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      ⏱️ {service.duration_minutes} min duration
                    </span>
                  </div>
                  <span className="font-heading text-sm font-extrabold text-brand-400">
                    ₹{service.price.toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Picker Input */}
      <div className="space-y-2">
        <label
          htmlFor="booking-date"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          2. Select Date
        </label>
        <input
          id="booking-date"
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#273647]/90 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all"
        />
      </div>
    </div>
  );
}
