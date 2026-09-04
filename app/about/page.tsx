import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Learn more about Slotly, the modern business booking platform.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8 overflow-hidden">
      {/* Consumer-Facing Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/10 blur-[140px] dark:bg-sky-500/15 animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[140px] dark:bg-purple-900/15 animate-glow-float-alt" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-heading text-lg font-extrabold text-white shadow-md shadow-brand-500/20 dark:bg-brand-500">
              S
            </div>
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                About Slotly
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modern business booking platform
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Slotly is a seamless appointment scheduling and business management platform designed to connect service providers with customers in real time.
            </p>
            <p>
              Whether you are managing operating schedules or reserving local services, Slotly provides an effortless and reliable booking experience.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Link
              href="/businesses"
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Explore Businesses →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
