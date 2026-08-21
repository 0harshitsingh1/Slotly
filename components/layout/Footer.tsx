import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Brand & Tagline */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                Slotly
              </span>
              <span className="text-xs text-slate-400 font-normal">| Appointment Scheduling</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seamless appointment booking and scheduling for service providers and clients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/businesses"
              className="hover:text-brand-600 transition dark:hover:text-brand-400"
            >
              Explore Businesses
            </Link>
            <a
              href="/businesses"
              className="hover:text-brand-600 transition dark:hover:text-brand-400"
            >
              About
            </a>
            <a
              href="mailto:support@slotly.app"
              className="hover:text-brand-600 transition dark:hover:text-brand-400"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Slotly Platform. All rights reserved.</p>
          <p className="mt-1 sm:mt-0">Built with Next.js, Auth.js & Prisma.</p>
        </div>
      </div>
    </footer>
  );
}
