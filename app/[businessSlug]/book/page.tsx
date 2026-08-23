import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import BookForm from "./BookForm";

interface BookPageProps {
  params: Promise<{
    businessSlug: string;
  }>;
  searchParams: Promise<{
    service?: string;
    start?: string;
  }>;
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { businessSlug } = await params;
  const { service: serviceId, start: startAtStr } = await searchParams;

  const session = await auth();

  // If customer is not logged in, prompt to log in or redirect
  if (!session?.user) {
    const callbackUrl = encodeURIComponent(
      `/${businessSlug}/book?service=${serviceId || ""}&start=${startAtStr || ""}`
    );
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  if (!serviceId || !startAtStr) {
    redirect(`/${businessSlug}`);
  }

  const business = await db.business.findUnique({
    where: { slug: businessSlug },
  });

  if (!business) {
    notFound();
  }

  const service = await db.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.business_id !== business.id) {
    notFound();
  }

  const startDate = new Date(startAtStr);
  if (isNaN(startDate.getTime())) {
    redirect(`/${businessSlug}`);
  }

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: business.timezone,
  }).format(startDate);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Link
            href={`/${businessSlug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to available slots
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Confirm Booking
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review details below to complete your appointment reservation.
          </p>
        </div>

        <BookForm
          businessId={business.id}
          serviceId={service.id}
          customerId={session.user.id}
          startAt={startDate.toISOString()}
          businessSlug={businessSlug}
          businessName={business.name}
          businessTimezone={business.timezone}
          serviceName={service.name}
          price={service.price}
          durationMinutes={service.duration_minutes}
          formattedTime={formattedTime}
        />
      </div>
    </div>
  );
}
