import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditBusinessForm } from "../_components/EditBusinessForm";
import { BusinessImageManager } from "../_components/BusinessImageManager";

export const metadata = {
  title: "Edit Business Profile — Slotly",
  description: "Update your business profile details, address, photos, and location coordinates.",
};

export default async function EditBusinessPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
    include: {
      images: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!business) {
    redirect("/owner/business/new");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/owner"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Dashboard
          </Link>

          <Link
            href={`/${business.slug}`}
            target="_blank"
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View Public Page ↗
          </Link>
        </div>

        {/* Business Photo Management */}
        <BusinessImageManager images={business.images} />

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Edit Business Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your business details, address, timezone, and location coordinates.
            </p>
          </div>

          <EditBusinessForm business={business} />
        </div>
      </div>
    </div>
  );
}
