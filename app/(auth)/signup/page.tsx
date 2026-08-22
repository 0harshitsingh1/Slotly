"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"OWNER" | "CUSTOMER">("CUSTOMER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signupAction({ name, email, password, role });
      if (!res.success) {
        setError(res.error || "Failed to sign up");
        setLoading(false);
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setError("Google Sign-Up is configured for demo display. Please register using the form below.");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Subtle Animated Background Mesh Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-brand-500/10 blur-[120px] dark:bg-brand-500/20 animate-glow-float" />

      <div className="w-full max-w-lg space-y-5 sm:space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        {/* Header Visual Hierarchy */}
        <div className="space-y-2.5 text-center">
          <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30 dark:bg-brand-500">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create your Slotly account
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Join Slotly to start booking and managing appointments
            </p>
          </div>
        </div>

        {/* Error Notification */}
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
          onClick={handleGoogleSignup}
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
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          {/* Account Role Selector Cards */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Account Role <span className="text-danger-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setRole("CUSTOMER")}
                className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  role === "CUSTOMER"
                    ? "border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Customer
                  </span>
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    checked={role === "CUSTOMER"}
                    onChange={() => setRole("CUSTOMER")}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Book appointments with local service providers.
                </p>
              </div>

              <div
                onClick={() => setRole("OWNER")}
                className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  role === "OWNER"
                    ? "border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Business Owner
                  </span>
                  <input
                    type="radio"
                    name="role"
                    value="OWNER"
                    checked={role === "OWNER"}
                    onChange={() => setRole("OWNER")}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  List services, photos, and manage customer bookings.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Create Account
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
