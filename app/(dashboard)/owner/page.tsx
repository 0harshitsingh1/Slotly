import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Owner Dashboard — Slotly",
  description: "Manage your business, services, availability schedule, and customer reservations.",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || "UTC",
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleString();
  }
}

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
    include: {
      _count: {
        select: {
          services: true,
          availabilities: true,
          availabilityExceptions: true,
        },
      },
    },
  });

  const allBookings = business
    ? await db.booking.findMany({
        where: { business_id: business.id },
        include: {
          service: {
            select: { name: true, price: true, duration_minutes: true },
          },
          customer: {
            select: { name: true, email: true },
          },
        },
        orderBy: { start_at: "desc" },
      })
    : [];

  const now = new Date();
  const totalBookings = allBookings.length;
  const upcomingBookings = allBookings.filter((b) => b.end_at >= now && b.status !== "CANCELLED").length;

  const totalRevenue = allBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const recentBookings = allBookings.slice(0, 5);

  const navCards: Array<{
    title: string;
    description: string;
    href: string;
    icon: string;
    badge: string;
    badgeVariant: BadgeVariant;
  }> = [
    {
      title: "Business Settings",
      description: "Manage business name, description, address, photos, and location coordinates.",
      href: business ? "/owner/business/edit" : "/owner/business/new",
      icon: "🏢",
      badge: business ? "Configured" : "Action Needed",
      badgeVariant: business ? "success" : "warning",
    },
    {
      title: "Services",
      description: "Define appointment offerings with duration, prices, and buffer times.",
      href: "/owner/services",
      icon: "💇‍♂️",
      badge: business ? `${business._count.services} active` : "0 active",
      badgeVariant: "brand",
    },
    {
      title: "Availability Schedule",
      description: "Set recurring weekly operating hours and date-specific holiday exceptions.",
      href: "/owner/availability",
      icon: "📅",
      badge: business
        ? `${business._count.availabilities} days / ${business._count.availabilityExceptions} exceptions`
        : "Not set",
      badgeVariant: "info",
    },
    {
      title: "Customer Bookings",
      description: "View, confirm, filter, and manage all incoming client appointment reservations.",
      href: "/owner/bookings",
      icon: "🎟️",
      badge: `${upcomingBookings} upcoming`,
      badgeVariant: "success",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Owner Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{session.user.email}</span>
            </p>
          </div>

          {business ? (
            <div className="flex items-center gap-3 shrink-0">
              <Link href={`/${business.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  View Public Page ↗
                </Button>
              </Link>
              <Link href="/owner/business/edit">
                <Button variant="primary" size="sm">
                  ✏️ Edit Profile
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/owner/business/new">
              <Button variant="primary" size="sm">
                + Create Business Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Business Header Banner if business exists */}
        {business && (
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/50 dark:bg-brand-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏬</span>
              <div>
                <span className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  {business.name}
                </span>
                <span className="ml-2 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  /{business.slug}
                </span>
                {business.address && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-md">
                    📍 {business.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card 1: Total Bookings */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Bookings
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 text-lg">
                  📊
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalBookings}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lifetime client reservations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Upcoming Bookings */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Upcoming Bookings
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-950/60 dark:text-success-400 text-lg">
                  📅
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {upcomingBookings}
                </p>
                <p className="mt-1 text-xs text-success-600 dark:text-success-400 font-medium">
                  Active scheduled appointments
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Revenue */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirmed Revenue
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-950/60 dark:text-info-400 text-lg">
                  💰
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Sum of confirmed booking prices
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Navigation Cards */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
            Business Management
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {navCards.map((item) => (
              <Card key={item.title} hoverable className="flex flex-col justify-between p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={item.href}>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>Manage</span>
                      <span>→</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Bookings Preview List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Recent Bookings</span>
              <Badge variant="neutral">{recentBookings.length}</Badge>
            </h2>
            <Link href="/owner/bookings">
              <Button variant="ghost" size="sm">
                View All Bookings →
              </Button>
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <Card>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {b.service?.name || "Service"}
                        </span>
                        <Badge status={b.status as any} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Customer: <span className="font-medium text-slate-900 dark:text-slate-200">{b.customer?.name || b.customer?.email}</span> ({b.customer?.email})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        🕒 {formatDate(b.start_at, business?.timezone)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(b.service?.price || 0)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {b.service?.duration_minutes} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No customer bookings recorded yet. Share your business page URL to start accepting reservations!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
