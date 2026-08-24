"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { Spinner } from "@/components/ui/Spinner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Background Ambient Violet Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-brand-500/10 rounded-full blur-[120px] -z-10 animate-glow-float" />

      <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.18)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden">
        {/* Top Accent Gradient Bar (Stitch Design) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500" />

        {/* Header Visual Hierarchy */}
        <div className="space-y-2 text-center flex flex-col items-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#273647] text-brand-400 shadow-md border border-white/10 mb-1">
            <svg className="h-6 w-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 dark:text-white">
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400">
            Join Slotly to start booking and managing appointments
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-danger-500/30 bg-danger-950/40 p-3.5 text-xs font-semibold text-danger-300">
            ⚠️ {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Stitch Segmented Role Selector Pill */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-slate-300">
              I am a... <span className="text-danger-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1 bg-[#122131] p-1 rounded-full border border-white/5">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`py-2 px-3 rounded-full text-xs font-extrabold transition-all duration-200 text-center ${
                  role === "CUSTOMER"
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`py-2 px-3 rounded-full text-xs font-extrabold transition-all duration-200 text-center ${
                  role === "OWNER"
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Business Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-slate-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full bg-[#273647]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 shadow-[0_0_15px_rgba(160,120,255,0.1)] transition-all duration-200"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300">
              Email Address <span className="text-danger-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#273647]/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 shadow-[0_0_15px_rgba(160,120,255,0.1)] transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-300">
              Password <span className="text-danger-400">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                <span>Create Account</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs sm:text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
