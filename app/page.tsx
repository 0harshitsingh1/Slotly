import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Slotly — Modern Online Appointment Scheduling Platform",
  description: "Seamless online booking and appointment management for local businesses and clients.",
};

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Consumer & Business Ambient Mesh Glow Backgrounds */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[800px] rounded-full bg-brand-500/15 blur-[160px] animate-glow-float pointer-events-none" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-[140px] animate-glow-float-alt pointer-events-none" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 space-y-20">
        {/* HERO SECTION */}
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

        {/* HOW IT WORKS SECTION */}
        <section className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
              How Slotly Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Book your appointment or manage your business schedule in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-md backdrop-blur-xl space-y-4 relative overflow-hidden group hover:border-brand-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(160,120,255,0.2)]">
                🔍
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Step 01</span>
                <h3 className="font-heading text-lg font-extrabold text-slate-100">
                  Discover Businesses
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Search local service providers across salons, medical clinics, fitness trainers, and tutors with location filtering.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-md backdrop-blur-xl space-y-4 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                📅
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Step 02</span>
                <h3 className="font-heading text-lg font-extrabold text-slate-100">
                  Pick an Open Slot
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Select your desired service, date, and open time slot. Slots calculate automatically based on provider availability and buffer times.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-md backdrop-blur-xl space-y-4 relative overflow-hidden group hover:border-[#10B981]/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                ✅
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Step 03</span>
                <h3 className="font-heading text-lg font-extrabold text-slate-100">
                  Instant Confirmation
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Receive immediate reservation confirmation with timezone formatting and full access to manage your bookings anytime.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section className="rounded-3xl border border-white/10 bg-[#161b22]/90 p-8 sm:p-12 shadow-xl space-y-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Built for Everyone</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">
                Designed for Customers &amp; Business Owners
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Slotly streamlines operations for service providers while giving customers a seamless booking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Customers */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-extrabold text-brand-300 flex items-center gap-2">
                <span>👤</span> For Customers
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold mt-0.5">✓</span>
                  <span>Explore verified local businesses and compare services &amp; pricing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold mt-0.5">✓</span>
                  <span>Automatic customer local browser timezone formatting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold mt-0.5">✓</span>
                  <span>Personalized dashboard to view upcoming and past reservations.</span>
                </li>
              </ul>
            </div>

            {/* For Business Owners */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-extrabold text-indigo-300 flex items-center gap-2">
                <span>🏬</span> For Business Owners
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                  <span>Define weekly operating schedules and date-specific holiday exceptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                  <span>Set service duration, prices, and automated buffer times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                  <span>Manage incoming client reservations with real-time revenue analytics.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA CALLOUT BANNER */}
        <section className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-900/60 via-indigo-950/80 to-[#161b22] p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-2 max-w-2xl mx-auto relative z-10">
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Simplify Your Scheduling?
            </h2>
            <p className="text-xs sm:text-base text-slate-300">
              Join Slotly today. Start discovering local services or create your own business booking profile in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link href="/businesses" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs sm:text-sm px-8 py-3.5 shadow-[0_0_24px_rgba(160,120,255,0.3)] transition-all">
                Browse Directory
              </button>
            </Link>
            {!user && (
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white font-heading font-extrabold text-xs sm:text-sm px-8 py-3.5 transition-all">
                  Create an Account
                </button>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
