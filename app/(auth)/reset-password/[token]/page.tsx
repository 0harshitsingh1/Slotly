import Link from "next/link";
import { validateResetTokenAction } from "@/app/actions/auth";
import ResetPasswordForm from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

export const metadata = {
  title: "Reset Password",
  description: "Set a new password for your Slotly account.",
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  const validation = await validateResetTokenAction(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {!validation.valid ? (
          <div className="space-y-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-300">
              <p className="font-semibold mb-1">Invalid or Expired Link</p>
              <p>{validation.error || "This password reset link is invalid or has expired."}</p>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Request New Reset Link →
              </Link>
            </div>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </div>
  );
}
