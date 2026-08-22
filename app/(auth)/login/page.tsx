"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

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

  const handleGoogleLogin = () => {
    setError("Google Sign-In is configured for demo display. Please log in with your email & password.");
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

      {/* Social Provider Button */}
      <Button
        variant="outline"
        size="md"
        fullWidth
        type="button"
        icon={<GoogleIcon />}
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative my-3 sm:my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[11px] sm:text-xs uppercase">
          <span className="bg-white px-3 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            Or continue with email
          </span>
        </div>
      </div>

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

      <Suspense fallback={<div className="text-center text-slate-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
