import { auth } from "@/lib/auth";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CtaBanner } from "@/components/landing/CtaBanner";

export const metadata = {
  title: "Modern Online Appointment Scheduling Platform",
  description: "Seamless online booking and appointment management for local businesses and clients.",
};

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 overflow-hidden font-sans">
      {/* Ambient Mesh Glow Backgrounds */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[800px] rounded-full bg-brand-500/15 blur-[160px] animate-glow-float pointer-events-none" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-[140px] animate-glow-float-alt pointer-events-none" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 space-y-20">
        <HeroSection user={user} />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaBanner user={user} />
      </div>
    </div>
  );
}
