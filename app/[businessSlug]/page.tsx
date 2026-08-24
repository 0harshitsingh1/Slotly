import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots/getAvailableSlots";
import BookingControls from "./BookingControls";

interface BusinessBookingPageProps {
  params: Promise<{
    businessSlug: string;
  }>;
  searchParams: Promise<{
    service?: string;
    date?: string;
  }>;
}

function formatSlotTime(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(date));
  } catch {
    // Explicit UTC fallback to avoid relying on server Node runtime machine local timezone
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(new Date(date));
  }
}

export default async function BusinessBookingPage({
  params,
  searchParams,
}: BusinessBookingPageProps) {
  const { businessSlug } = await params;
  const { service: queryServiceId, date: queryDate } = await searchParams;

  // 1. Fetch business, services, and photos
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    include: {
      services: true,
      images: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Determine selected service & date
  const selectedServiceId =
    queryServiceId || (business.services.length > 0 ? business.services[0].id : "");

  // Compute today's date (YYYY-MM-DD) in the business's timezone
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: business.timezone,
  }).format(new Date());

  const selectedDateStr = queryDate || todayStr;

  const selectedService = business.services.find(
    (s) => s.id === selectedServiceId
  );

  // 2. Fetch available slots if service and date are selected
  let slotsResult: { slots: { startAt: Date; endAt: Date }[]; isClosed: boolean } = {
    slots: [],
    isClosed: false,
  };
  let slotsFetched = false;
  let dayName = "";

  if (selectedServiceId && selectedDateStr) {
    const targetDate = new Date(`${selectedDateStr}T12:00:00Z`);
    slotsResult = await getAvailableSlots(
      business.id,
      selectedServiceId,
      targetDate
    );
    slotsFetched = true;

    dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: business.timezone,
    }).format(targetDate);
  }

  const availableSlots = slotsResult.slots;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Consumer Ambient Mesh Glow Background (Stitch Design) */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-brand-500/10 blur-[140px] animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] animate-glow-float-alt" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* Navigation Link */}
        <div>
          <Link
            href="/businesses"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
          >
            <span>←</span> Back to Directory
          </Link>
        </div>

        {/* Business Header & Dynamic Image Gallery */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
                {business.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
                <span>🕒 {business.timezone}</span>
                {business.address && (
                  <>
                    <span>•</span>
                    <span className="truncate">📍 {business.address}</span>
                  </>
                )}
                <span>•</span>
                <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-extrabold text-brand-300">
                  {business.services.length} Services Available
                </span>
              </div>
            </div>
          </div>

          {/* Stitch Bento Gallery Grid - Responsive Image Handling */}
          {business.images.length === 1 ? (
            <div className="relative h-[260px] sm:h-[360px] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#161b22] shadow-xl group">
              <Image
                src={business.images[0].url}
                alt={`${business.name} main cover photo`}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22]/80 via-transparent to-transparent" />
            </div>
          ) : business.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2.5 h-[260px] sm:h-[360px] rounded-2xl overflow-hidden border border-white/10 bg-[#161b22] shadow-xl">
              {business.images.map((img, idx) => (
                <div key={img.id} className="relative group overflow-hidden bg-slate-900">
                  <Image
                    src={img.url}
                    alt={`${business.name} photo ${idx + 1}`}
                    fill
                    sizes="50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : business.images.length >= 3 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-2.5 h-[280px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/10 bg-[#161b22] shadow-xl">
              {/* Main Cover Image */}
              <div className="col-span-2 row-span-2 relative group overflow-hidden bg-slate-900">
                <Image
                  src={business.images[0].url}
                  alt={`${business.name} main cover photo`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22]/80 via-transparent to-transparent" />
              </div>

              {/* Side Photos */}
              {business.images.slice(1, 4).map((img, idx, arr) => (
                <div
                  key={img.id}
                  className={`relative group overflow-hidden bg-slate-900 ${
                    arr.length === 2 && idx === 1
                      ? "col-span-2 row-span-2"
                      : idx === 2 && arr.length === 3
                      ? "col-span-2 sm:col-span-1"
                      : "col-span-1"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${business.name} photo ${idx + 2}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Clean Cover Hero Fallback when no photos uploaded */
            <div className="h-44 sm:h-56 w-full rounded-2xl border border-white/10 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-950 p-8 flex flex-col justify-end relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white z-10">
                {business.name}
              </h2>
              {business.address && (
                <p className="text-xs sm:text-sm text-slate-300 z-10 mt-1">
                  📍 {business.address}
                </p>
              )}
            </div>
          )}
        </section>

        {/* 2-Column Responsive Layout: Left Details, Right Sticky Booking Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Left Column: Business Details & Services */}
          <div className="lg:col-span-7 space-y-8">
            {/* About Section */}
            {business.description && (
              <section className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 shadow-md backdrop-blur-xl space-y-3">
                <h2 className="font-heading text-xl font-extrabold text-slate-100">
                  About
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {business.description}
                </p>
              </section>
            )}

            {/* Services List Section */}
            <section className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 shadow-md backdrop-blur-xl space-y-4">
              <h2 className="font-heading text-xl font-extrabold text-slate-100">
                Services &amp; Pricing ({business.services.length})
              </h2>

              {business.services.length === 0 ? (
                <p className="text-xs italic text-slate-500">
                  No services configured for this business yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {business.services.map((service) => {
                    const isSelected = service.id === selectedServiceId;
                    return (
                      <Link
                        key={service.id}
                        href={`/${businessSlug}?service=${service.id}&date=${selectedDateStr}`}
                        className="block"
                      >
                        <div
                          className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-brand-400 bg-brand-500/15 shadow-md ring-1 ring-brand-400/30"
                              : "border-white/10 bg-[#273647]/50 hover:border-white/20 hover:bg-[#273647]/80"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading text-sm sm:text-base font-extrabold text-slate-100 group-hover:text-brand-300 transition-colors">
                                {service.name}
                              </h3>
                              {isSelected && (
                                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300 border border-brand-500/30">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              ⏱️ {service.duration_minutes} min duration
                              {service.buffer_minutes > 0 && ` (${service.buffer_minutes} min buffer)`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className="font-heading text-base sm:text-lg font-extrabold text-brand-400">
                              ₹{service.price.toFixed(0)}
                            </span>
                            <span
                              className={`rounded-full font-heading font-extrabold text-xs px-4 py-1.5 transition-all ${
                                isSelected
                                  ? "bg-brand-500 text-white shadow-[0_0_12px_rgba(160,120,255,0.4)]"
                                  : "bg-brand-500/15 text-brand-300 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Location & Timezone Details */}
            <section className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 shadow-md backdrop-blur-xl space-y-3">
              <h2 className="font-heading text-xl font-extrabold text-slate-100">
                Location &amp; Hours
              </h2>
              {business.address ? (
                <p className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                  <span className="mt-0.5">📍</span>
                  <span className="whitespace-pre-line leading-relaxed">{business.address}</span>
                </p>
              ) : (
                <p className="text-xs italic text-slate-500">Address not specified.</p>
              )}
              <p className="text-xs text-slate-400">
                Operating Timezone: <strong className="text-slate-200">{business.timezone}</strong>
              </p>
            </section>
          </div>

          {/* Right Column: Sticky Booking Widget (Stitch Design) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#161b22]/95 p-6 shadow-[0_12px_48px_rgba(139,92,246,0.18)] backdrop-blur-xl space-y-6">
              <div className="space-y-1 border-b border-white/10 pb-4">
                <h3 className="font-heading text-xl font-extrabold text-slate-100">
                  Book Appointment
                </h3>
                <p className="text-xs text-slate-400">
                  Choose a service, date, and available time slot below
                </p>
              </div>

              {/* Service & Date Selector Component */}
              <BookingControls
                services={business.services}
                selectedServiceId={selectedServiceId}
                selectedDate={selectedDateStr}
                businessSlug={businessSlug}
              />

              {/* Slots Section */}
              {selectedService && slotsFetched && (
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-sm font-extrabold text-slate-200">
                      Available Slots for {selectedService.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {selectedDateStr}
                    </span>
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => {
                        const startFormatted = formatSlotTime(
                          slot.startAt,
                          business.timezone
                        );
                        const endFormatted = formatSlotTime(
                          slot.endAt,
                          business.timezone
                        );
                        const bookUrl = `/${businessSlug}/book?service=${selectedServiceId}&start=${encodeURIComponent(
                          slot.startAt.toISOString()
                        )}`;

                        return (
                          <Link
                            key={index}
                            href={bookUrl}
                            className="group flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#273647]/80 p-2.5 text-center transition-all hover:border-brand-400 hover:bg-brand-500 hover:text-white shadow-sm"
                          >
                            <span className="text-xs sm:text-sm font-extrabold text-slate-100 group-hover:text-white">
                              {startFormatted}
                            </span>
                            <span className="text-[10px] text-slate-400 group-hover:text-white/80">
                              to {endFormatted}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : slotsResult.isClosed ? (
                    /* Closed Notice */
                    <div className="rounded-xl border border-dashed border-danger-500/30 bg-danger-950/30 p-4 text-center space-y-1">
                      <h4 className="text-xs font-bold text-danger-300">
                        Closed on {dayName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        No operating hours configured for {dayName}s. Please select another date.
                      </p>
                    </div>
                  ) : (
                    /* Fully Booked Notice */
                    <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-950/30 p-4 text-center space-y-1">
                      <h4 className="text-xs font-bold text-amber-300">
                        Fully Booked / No Slots Available
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        No open time slots available on {selectedDateStr}. Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
