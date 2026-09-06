export function HowItWorksSection() {
  return (
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
  );
}
