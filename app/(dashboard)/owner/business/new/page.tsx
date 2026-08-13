import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateBusinessForm } from "./_components/CreateBusinessForm";

export const metadata = {
  title: "Create Business — Slotly",
  description: "Set up your business profile on Slotly.",
};

export default async function NewBusinessPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  // If owner already has a business, redirect to services
  const existing = await db.business.findFirst({
    where: { owner_id: session.user.id },
  });

  if (existing) {
    redirect("/owner/services");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/owner"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Create Your Business
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This sets up your business profile. You can add services and
              availability after this step.
            </p>
          </div>

          <CreateBusinessForm />
        </div>
      </div>
    </div>
  );
}
