"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const isReset = searchParams.get("reset");
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
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
    <div className="w-full max-w-md space-y-5 sm:space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      {/* Header Visual Hierarchy */}
      <div className="space-y-2.5 text-center">
        <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30 dark:bg-brand-500">
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back to Slotly
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your email and password to log in
          </p>
        </div>
      </div>

      {/* Notifications */}
      {registered && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-3.5 text-xs font-semibold text-success-700 dark:border-success-900 dark:bg-success-950/60 dark:text-success-300">
          ✓ Account created successfully! Please log in below.
        </div>
      )}

      {isReset && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-3.5 text-xs font-semibold text-success-700 dark:border-success-900 dark:bg-success-950/60 dark:text-success-300">
          ✓ Password updated successfully! Log in with your new password.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-xs font-semibold text-danger-700 dark:border-danger-900 dark:bg-danger-950/60 dark:text-danger-300">
          ⚠️ {error}
        </div>
      )}

      {/* Login Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password <span className="text-danger-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-500"
          />
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth isLoading={loading}>
          Log In
        </Button>
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Subtle Animated Background Mesh Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-brand-500/10 blur-[120px] dark:bg-brand-500/20 animate-glow-float" />

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
