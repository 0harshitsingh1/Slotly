interface BusinessBookingPageProps {
  params: Promise<{
    businessSlug: string;
  }>;
}

export default async function BusinessBookingPage({
  params,
}: BusinessBookingPageProps) {
  const { businessSlug } = await params;

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Book with <span className="capitalize">{businessSlug}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Select a service and time slot to complete your reservation.
        </p>
      </div>
    </div>
  );
}
