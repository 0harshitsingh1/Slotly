import Link from "next/link";

export const metadata = {
  title: "Support",
  description: "Get assistance and support for your Slotly account and bookings.",
};

export default function SupportPage() {
  const supportEmail = "harshitsingh5225@gmail.com";
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent("Slotly Support Request")}`;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Consumer-Facing Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/10 blur-[140px] animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[140px] animate-glow-float-alt" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.15)] backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xl shadow-[0_0_20px_rgba(160,120,255,0.2)]">
              🎧
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100">
                Customer Support
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Help &amp; Assistance Center
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              Need help with your appointments, business schedule, or account settings? Our support team is here to assist you.
            </p>

            <div className="pt-2">
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-heading font-extrabold text-xs sm:text-sm px-6 py-3 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all duration-200"
              >
                <span>✉️</span>
                <span>Contact Support</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <Link
              href="/businesses"
              className="inline-flex items-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs px-5 py-2.5 transition-all"
            >
              Explore Businesses
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs px-5 py-2.5 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
