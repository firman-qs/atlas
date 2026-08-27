import { GuidesFaqSection } from "@/features/landing/components/guides-faq-section";
import { InteractiveFeaturesConsole } from "@/features/landing/components/interactive-features-console";
import { LandingFieldCanvas } from "@/features/landing/components/landing-field-canvas";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { ProjectSection } from "@/features/landing/components/project-section";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen scroll-smooth bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-background dark:from-slate-950 dark:via-blue-950/20 dark:to-background text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Multi-layered Atmospheric Gradient Mesh for vibrant modern color */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top Hero Cyan / Blue Ambient Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.16),rgba(99,102,241,0.08),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22),rgba(99,102,241,0.12),transparent_70%)]" />

        {/* Mid-Right Indigo Ambient Glow */}
        <div className="absolute top-[35%] -right-40 size-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),rgba(147,51,234,0.06),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),rgba(147,51,234,0.10),transparent_70%)]" />

        {/* Mid-Left Sky / Emerald Ambient Glow */}
        <div className="absolute top-[65%] -left-40 size-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.12),rgba(16,185,129,0.05),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.16),rgba(16,185,129,0.08),transparent_70%)]" />

        {/* Bottom Blue / Purple Ambient Glow */}
        <div className="absolute bottom-20 left-1/3 size-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.10),rgba(139,92,246,0.06),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),rgba(139,92,246,0.10),transparent_70%)]" />
      </div>

      {/* Interactive Electromagnetic Vector Field Background (Vibrant & Cursor-Reactive) */}
      <LandingFieldCanvas />

      {/* Navigation Header with Windows 11 Acrylic / Frosted Glass */}
      <LandingHeader />

      {/* Main Streamlined Narrative Flow */}
      <main className="relative z-10">
        <LandingHero />
        <InteractiveFeaturesConsole />
        <GuidesFaqSection />
        <ProjectSection />
      </main>

      {/* Academic Frosted Footer */}
      <LandingFooter />
    </div>
  );
}
