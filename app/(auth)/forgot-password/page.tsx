"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { Spinner } from "@/components/ui/Spinner";

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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Background Ambient Violet Glow (Stitch Design) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-brand-500/10 rounded-full blur-[120px] -z-10 animate-glow-float" />

      <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.18)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden">
        {/* Subtle Top Highlight Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header Visual Hierarchy */}
        <div className="space-y-2 text-center flex flex-col items-center">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#273647] text-brand-400 shadow-md border border-white/10 mb-1">
            <svg className="h-7 w-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-success-500/30 bg-success-950/40 p-4 text-xs sm:text-sm text-success-300 space-y-1">
              <p className="font-bold text-success-200 flex items-center gap-1.5">
                <span>✓</span> Check your email
              </p>
              <p className="leading-relaxed">
                If an account with <strong className="text-white">{email}</strong> exists, we have sent instructions to reset your password.
              </p>
            </div>
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="font-semibold text-xs sm:text-sm text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
              >
                <span>←</span> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="rounded-xl border border-danger-500/30 bg-danger-950/40 p-3.5 text-xs font-semibold text-danger-300">
                ⚠️ {error}
              </div>
            )}

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#273647]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 shadow-[0_0_15px_rgba(160,120,255,0.1)] transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-heading font-extrabold text-sm sm:text-base py-3 sm:py-3.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(160,120,255,0.3)] hover:shadow-[0_0_30px_rgba(160,120,255,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center pt-2 text-xs sm:text-sm text-slate-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
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
