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
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8 overflow-hidden">
      {/* Consumer-Facing Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/10 blur-[140px] dark:bg-sky-500/15" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[140px] dark:bg-purple-900/15" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* Business Header */}
        <header className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {business.name}
              </h1>
              {business.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {business.description}
                </p>
              )}
              {business.address && (
                <p className="mt-2.5 flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span aria-hidden="true" className="mt-0.5 shrink-0">📍</span>
                  <span className="whitespace-pre-line break-words leading-relaxed">{business.address}</span>
                </p>
              )}
            </div>
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 self-start sm:self-auto shrink-0">
              Timezone: {business.timezone}
            </div>
          </div>

          {/* Photo Gallery (rendered ONLY if images exist) */}
          {business.images.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                Photos ({business.images.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {business.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900 group"
                  >
                    <Image
                      src={img.url}
                      alt={`${business.name} photo`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Services List summary section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Select Appointment
          </h2>
          <BookingControls
            services={business.services}
            selectedServiceId={selectedServiceId}
            selectedDate={selectedDateStr}
            businessSlug={businessSlug}
          />
        </section>

        {/* Available Time Slots Section */}
        {selectedService && slotsFetched && (
          <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Available Slots for {selectedService.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedDateStr} • All times shown in {business.timezone}
                </p>
              </div>
            </div>

            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
                      className="group flex flex-col items-center justify-center rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-center transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:border-blue-500 dark:hover:bg-blue-600"
                    >
                      <span className="text-sm font-semibold text-blue-900 group-hover:text-white dark:text-blue-200">
                        {startFormatted}
                      </span>
                      <span className="text-xs text-blue-600 group-hover:text-blue-100 dark:text-blue-400">
                        to {endFormatted}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : slotsResult.isClosed ? (
              /* Case 1: Closed on [day name] */
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
                <div className="rounded-full bg-red-50 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Closed on {dayName}
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This business is closed or has no operating hours configured for {dayName}s ({selectedDateStr}). Please try selecting a different date.
                </p>
              </div>
            ) : (
              /* Case 2: Fully Booked / No Slots Available */
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
                <div className="rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Fully Booked / No Slots Available
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  There are no open time slots for this service on {selectedDateStr}. Please try selecting a different date.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
