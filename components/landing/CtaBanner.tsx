import Link from "next/link";
import { User } from "next-auth";

interface CtaBannerProps {
  user?: User;
}

export function CtaBanner({ user }: CtaBannerProps) {
  return (
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
  );
}
