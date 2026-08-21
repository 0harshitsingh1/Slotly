import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { AddServiceForm } from "./_components/AddServiceForm";

export const metadata = {
  title: "Services — Slotly Owner Dashboard",
  description: "Manage services offered by your business.",
};

export default async function ServicesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const ownerId = session.user.id;

  const business = await db.business.findFirst({
    where: { owner_id: ownerId },
    include: {
      services: {
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/owner"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Dashboard
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Services
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Business header */}
        {!business ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <h1 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
              No business found
            </h1>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              You need to create a business before adding services.
            </p>
            <Link
              href="/owner/business/new"
              className="mt-4 inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-700"
            >
              Create Business →
            </Link>
          </div>
        ) : (
          <>
            {/* Business info strip */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {business.name}
                  </h1>
                  {business.description && (
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {business.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1 text-xs text-gray-400 sm:items-end">
                  <span className="font-mono">/{business.slug}</span>
                  <span>{business.timezone.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>

            {/* Services table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Services
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {business.services.length}
                  </span>
                </h2>
              </div>

              {business.services.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  No services yet. Add your first service below.
                </div>
              ) : (
                <>
                  {/* Mobile Stacked Card View (<640px) */}
                  <div className="divide-y divide-gray-100 block sm:hidden dark:divide-gray-800 p-4 space-y-3">
                    {business.services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {service.name}
                          </span>
                          <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>⏱️ {service.duration_minutes} min duration</span>
                          {service.buffer_minutes > 0 && (
                            <span>🛡️ {service.buffer_minutes} min buffer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View (>=640px) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Buffer
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {business.services.map((service) => (
                          <tr
                            key={service.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                              {service.name}
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {service.duration_minutes} min
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {service.buffer_minutes > 0
                                ? `${service.buffer_minutes} min`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                              ${service.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Add service form */}
            <AddServiceForm />
          </>
        )}
      </div>
    </div>
  );
}
