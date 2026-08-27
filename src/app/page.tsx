import { GuidesFaqSection } from "@/features/landing/components/guides-faq-section";
import { InteractiveFeaturesConsole } from "@/features/landing/components/interactive-features-console";
import { LandingFieldCanvas } from "@/features/landing/components/landing-field-canvas";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { ProjectSection } from "@/features/landing/components/project-section";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen scroll-smooth bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
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
