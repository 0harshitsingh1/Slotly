import Link from "next/link";
import { User } from "next-auth";

interface HeroSectionProps {
  user?: User;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="text-center space-y-8 max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-4 py-1.5 text-xs font-extrabold text-brand-300 border border-brand-500/30 shadow-[0_0_20px_rgba(160,120,255,0.2)]">
        <span>⚡</span>
        <span>Seamless Appointment Scheduling Platform</span>
      </div>

      {/* Headline */}
      <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-[1.12]">
        Book Local Services in <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-indigo-300 bg-clip-text text-transparent">Seconds.</span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Discover top-rated salons, healthcare clinics, tutors, and wellness providers. Select your service, view live open slots, and confirm your reservation instantly.
      </p>

      {/* CTAs (Adapted to Auth State & User Role) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        {/* Primary CTA */}
        <Link href="/businesses" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-sm sm:text-base px-8 py-4 shadow-[0_0_28px_rgba(160,120,255,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>🔍 Explore Businesses</span>
            <span>→</span>
          </button>
        </Link>

        {/* Secondary CTA based on Auth State */}
        {user ? (
          user.role === "OWNER" ? (
            <Link href="/owner" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-sm sm:text-base px-8 py-4 transition-all flex items-center justify-center gap-2">
                <span>🏬 Owner Dashboard</span>
                <span>→</span>
              </button>
            </Link>
          ) : (
            <Link href="/customer" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-sm sm:text-base px-8 py-4 transition-all flex items-center justify-center gap-2">
                <span>📋 My Bookings</span>
                <span>→</span>
              </button>
            </Link>
          )
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-sm sm:text-base px-7 py-4 transition-all">
                Sign Up Free
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-full bg-transparent hover:text-brand-300 text-slate-300 font-heading font-extrabold text-sm sm:text-base px-5 py-4 transition-all">
                Log In
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Trust Highlights */}
      <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="text-brand-400 font-bold">✓</span> Real-Time Available Slots
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-brand-400 font-bold">✓</span> Automated Timezone Conversion
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-brand-400 font-bold">✓</span> Zero Double-Booking Guarantee
        </span>
      </div>
    </section>
  );
}
