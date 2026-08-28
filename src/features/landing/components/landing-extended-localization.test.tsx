import { render, screen } from "@/test/render";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CapabilitiesSection } from "@/features/landing/components/capabilities-section";
import { ConceptualLearningSection } from "@/features/landing/components/conceptual-learning-section";
import { InteractiveHeroLogo } from "@/features/landing/components/interactive-hero-logo";
import { InteractiveFeaturesConsole } from "@/features/landing/components/interactive-features-console";
import { InteractiveMascot } from "@/features/landing/components/interactive-mascot";
import { LearningLoopSection } from "@/features/landing/components/learning-loop-section";
import { PerspectivesSection } from "@/features/landing/components/perspectives-section";

describe("extended landing localization", () => {
  it("localizes every authored but currently unmounted section", () => {
    render(
      <>
        <CapabilitiesSection />
        <ConceptualLearningSection />
        <LearningLoopSection />
        <PerspectivesSection />
      </>,
      { locale: "id" },
    );

    expect(screen.getByText("Kapabilitas Platform")).toBeInTheDocument();
    expect(screen.getByText("Taksonomi Konseptual")).toBeInTheDocument();
    expect(
      screen.getByText(/Siklus Pembelajaran Formatif/),
    ).toBeInTheDocument();
    expect(screen.getByText("Dua Perspektif, Satu Sistem")).toBeInTheDocument();
    expect(screen.queryByText("Platform Capabilities")).not.toBeInTheDocument();
    expect(screen.queryByText("Conceptual Taxonomy")).not.toBeInTheDocument();
  });

  it("localizes interactive visual accessibility and helper text", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    render(
      <>
        <InteractiveHeroLogo />
        <InteractiveMascot />
      </>,
      { locale: "id" },
    );

    expect(
      screen.getByAltText("Logo Sistem Pembelajaran ATLAS"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Klik untuk memancarkan medan"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Maskot ATLAS")).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("localizes authored demo content while preserving stable course codes", () => {
    render(<InteractiveFeaturesConsole />, { locale: "id" });

    expect(
      screen.getByText("Hukum Coulomb & Muatan Titik"),
    ).toBeInTheDocument();
    expect(screen.getByText("PHY-EM-01")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("tab", { name: "Asesmen Formatif" }),
    );
    expect(screen.getByText("Kriteria Terpenuhi")).toBeInTheDocument();
    expect(screen.queryByText("Siklus Formatif Aktif")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Coulomb's Law & Point Charges"),
    ).not.toBeInTheDocument();
  });
});
