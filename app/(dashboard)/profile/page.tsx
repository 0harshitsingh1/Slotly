import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Account Profile",
  description: "Manage your personal account settings and profile details.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Account Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage your account credentials and personal details.
          </p>
        </div>

        <ProfileForm
          initialName={user.name || ""}
          email={user.email}
          role={user.role}
          createdAt={user.created_at ? user.created_at.toISOString() : null}
        />
      </div>
    </div>
  );
}
