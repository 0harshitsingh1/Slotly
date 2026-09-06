export function FeaturesSection() {
  return (
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
  );
}
