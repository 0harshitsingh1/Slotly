"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordResetAction(email);
      setLoading(false);

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || "Failed to process request. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your registered email address to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
              <p className="font-semibold mb-1">Check your email</p>
              <p>
                If an account with <strong>{email}</strong> exists, we have sent instructions to reset your password.
              </p>
            </div>
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>

            <div className="text-center pt-2 text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
