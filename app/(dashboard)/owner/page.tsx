import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";

export const metadata = {
  title: "Owner Dashboard — Slotly",
};

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
    include: { _count: { select: { services: true } } },
  });

  const exceptionCount = business
    ? await db.availabilityException.count({ where: { business_id: business.id } })
    : 0;

  const bookingCount = business
    ? await db.booking.count({ where: { business_id: business.id } })
    : 0;

  const navItems = [
    {
      title: "Business Profile",
      description: business
        ? `${business.name} — /${business.slug}`
        : "No business yet. Create one to get started.",
      href: business ? "/owner/services" : "/owner/business/new",
      linkLabel: business ? "Manage →" : "Create Business →",
      badge: null,
    },
    {
      title: "Services",
      description: "Define the services your business offers with pricing and duration.",
      href: "/owner/services",
      linkLabel: "Manage Services →",
      badge: business ? `${business._count.services} service${business._count.services !== 1 ? "s" : ""}` : null,
    },
    {
      title: "Weekly Availability",
      description: "Configure default recurring operating hours for Monday through Sunday.",
      href: "/owner/availability",
      linkLabel: "Manage Schedule →",
      badge: null,
    },
    {
      title: "Schedule Exceptions",
      description: "Set holidays, closures, or custom operating hours for specific dates.",
      href: "/owner/availability/exceptions",
      linkLabel: "Manage Exceptions →",
      badge: business ? `${exceptionCount} exception${exceptionCount !== 1 ? "s" : ""}` : null,
    },
    {
      title: "Bookings",
      description: "View and manage all customer reservations for your business.",
      href: "/owner/bookings",
      linkLabel: "Manage Bookings →",
      badge: business ? `${bookingCount} booking${bookingCount !== 1 ? "s" : ""}` : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Owner Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome back,{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {session.user.email}
              </span>
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Session info */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Session
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "User ID", value: session.user.id, mono: true },
              { label: "Email", value: session.user.email },
              { label: "Role", value: session.user.role, highlight: true },
            ].map(({ label, value, mono, highlight }) => (
              <div
                key={label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {label}
                </dt>
                <dd
                  className={`mt-1 truncate text-sm font-medium ${
                    mono ? "font-mono" : ""
                  } ${
                    highlight
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {value || "N/A"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Nav cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {navItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href={item.href}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {item.linkLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
