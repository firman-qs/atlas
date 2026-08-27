import { render, screen } from "@/test/render";
import { describe, expect, it, vi } from "vitest";

const { mockedUseAuth } = vi.hoisted(() => ({
  mockedUseAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: mockedUseAuth,
}));

import { GuidesFaqSection } from "@/features/landing/components/guides-faq-section";
import { InteractiveFeaturesConsole } from "@/features/landing/components/interactive-features-console";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { ProjectSection } from "@/features/landing/components/project-section";

describe("Landing Components Integration", () => {
  it("renders all landing sections in English without missing messages", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <div>
        <LandingHero />
        <InteractiveFeaturesConsole />
        <GuidesFaqSection />
        <ProjectSection />
        <LandingFooter />
      </div>,
      { locale: "en" },
    );

    expect(screen.getAllByText(/ATLAS/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Video Guides")).toBeInTheDocument();
    expect(screen.getByText("The people behind ATLAS")).toBeInTheDocument();
    expect(screen.getByText("Firman Qashdus Sabil")).toBeInTheDocument();
    expect(screen.getByText("Student / Developer")).toBeInTheDocument();
    expect(screen.getByText("Publication Status")).toBeInTheDocument();
    expect(screen.getByText("Funding")).toBeInTheDocument();
    expect(screen.getByText("© 2026 ATLAS. All rights reserved.")).toBeInTheDocument();
  });

  it("renders all landing sections in Indonesian without missing messages", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <div>
        <LandingHero />
        <InteractiveFeaturesConsole />
        <GuidesFaqSection />
        <ProjectSection />
        <LandingFooter />
      </div>,
      { locale: "id" },
    );

    expect(screen.getAllByText(/ATLAS/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Panduan Video")).toBeInTheDocument();
    expect(screen.getByText("Sosok di balik ATLAS")).toBeInTheDocument();
    expect(screen.getByText("Firman Qashdus Sabil")).toBeInTheDocument();
    expect(screen.getAllByText("Mahasiswa").length).toBeGreaterThan(0);
    expect(screen.getByText("Status Publikasi")).toBeInTheDocument();
    expect(screen.getByText("Pendanaan")).toBeInTheDocument();
    expect(screen.getByText("© 2026 ATLAS. Hak cipta dilindungi undang-undang.")).toBeInTheDocument();
  });
});
