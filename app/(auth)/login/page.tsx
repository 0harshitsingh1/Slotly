"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const isReset = searchParams.get("reset");
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction(email, password);
      if (!res.success) {
        setError(res.error || "Invalid email or password");
        setLoading(false);
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.18)] backdrop-blur-xl transition-all duration-300">
      {/* Header Visual Hierarchy (Stitch Design) */}
      <div className="space-y-2 text-center flex flex-col items-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#273647] text-brand-400 shadow-md border border-white/10 mb-1">
          <svg className="h-6 w-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 dark:text-white">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400">
          Sign in to your Slotly account
        </p>
      </div>

      {/* Notifications */}
      {registered && (
        <div className="rounded-xl border border-success-500/30 bg-success-950/40 p-3.5 text-xs font-semibold text-success-300">
          ✓ Account created successfully! Please log in below.
        </div>
      )}

      {isReset && (
        <div className="rounded-xl border border-success-500/30 bg-success-950/40 p-3.5 text-xs font-semibold text-success-300">
          ✓ Password updated successfully! Log in with your new password.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-950/40 p-3.5 text-xs font-semibold text-danger-300">
          ⚠️ {error}
        </div>
      )}

      {/* Login Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300">
            Email address
          </label>
          <div className="relative">
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
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-300">
              Password <span className="text-danger-400">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#273647]/90 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 shadow-[0_0_15px_rgba(160,120,255,0.1)] transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.88 9.88a3 3 0 104.24 4.24m2.83-2.83a10.05 10.05 0 013.99 6.89m-2.12-10.6a18.45 18.45 0 00-4.7 3.59" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
              <span>Sign in</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-xs sm:text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Background Ambient Violet Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-brand-500/10 rounded-full blur-[120px] -z-10 animate-glow-float" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Spinner size="md" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
