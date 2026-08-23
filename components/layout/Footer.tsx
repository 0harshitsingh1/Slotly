import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 text-xs text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
        <p>© 2026 Slotly Platform. All rights reserved.</p>
        <Link
          href="/about"
          className="hover:text-brand-600 transition dark:hover:text-brand-400 font-medium"
        >
          About
        </Link>
      </div>
    </footer>
  );
}
