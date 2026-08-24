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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Atmospheric Background Glows (Stitch Design) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-brand-500/10 rounded-full blur-[120px] -z-10 animate-glow-float" />

      <main className="w-full max-w-[600px] relative z-10 space-y-4">
        <div>
          <Link
            href={`/${businessSlug}`}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
          >
            <span>←</span> Back to available slots
          </Link>
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
      </main>
    </div>
  );
}
