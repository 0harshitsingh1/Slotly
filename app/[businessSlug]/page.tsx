import { notFound } from "next/navigation";
import Link from "next/link";
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
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

export default async function BusinessBookingPage({
  params,
  searchParams,
}: BusinessBookingPageProps) {
  const { businessSlug } = await params;
  const { service: queryServiceId, date: queryDate } = await searchParams;

  // 1. Fetch business and services
  const business = await db.business.findUnique({
    where: { slug: businessSlug },
    include: {
      services: true,
    },
  });

  if (!business) {
    notFound();
  }

  // Determine selected service & date
  const selectedServiceId =
    queryServiceId || (business.services.length > 0 ? business.services[0].id : "");

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDateStr = queryDate || todayStr;

  const selectedService = business.services.find(
    (s) => s.id === selectedServiceId
  );

  // 2. Fetch available slots if service and date are selected
  let availableSlots: { startAt: Date; endAt: Date }[] = [];
  let slotsFetched = false;

  if (selectedServiceId && selectedDateStr) {
    const targetDate = new Date(`${selectedDateStr}T12:00:00Z`);
    availableSlots = await getAvailableSlots(
      business.id,
      selectedServiceId,
      targetDate
    );
    slotsFetched = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Business Header */}
        <header className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
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
            </div>
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 self-start sm:self-auto">
              Timezone: {business.timezone}
            </div>
          </div>
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
            ) : (
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
