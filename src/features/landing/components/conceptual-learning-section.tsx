"use client";

import { useState } from "react";
import {
  ArrowDown,
  BookOpen,
  ListTree,
  Network,
  Sparkles,
} from "lucide-react";

interface SoloLevelInfo {
  level: string;
  badge: string;
  definition: string;
  physicsExample: string;
  assessmentFocus: string;
}

const soloLevels: SoloLevelInfo[] = [
  {
    level: "Unistructural",
    badge: "Foundational Aspect",
    definition:
      "Focuses on a single relevant conceptual aspect or simple formula application.",
    physicsExample:
      "Calculating the electrostatic force magnitude between two static point charges using Coulomb's constant.",
    assessmentFocus:
      "Diagnostic MCQs verifying correct parameter identification (charges q₁, q₂ and distance r).",
  },
  {
    level: "Multistructural",
    badge: "Multiple Independent Aspects",
    definition:
      "Deals with several relevant aspects in isolation or stepwise combination without full synthesis.",
    physicsExample:
      "Computing the resultant electric field vector at a specific coordinate produced by three discrete source charges using superposition.",
    assessmentFocus:
      "Vector resolution questions and essay explanations of directional cancellation along Cartesian axes.",
  },
  {
    level: "Relational",
    badge: "Integrated Conceptual Synthesis",
    definition:
      "Connects multiple conceptual aspects into a coherent, interrelated theoretical framework.",
    physicsExample:
      "Explaining how electric field lines, Gaussian surfaces, and potential differences collectively describe the behavior of a conducting sphere in equilibrium.",
    assessmentFocus:
      "Qualitative essay assessment evaluating depth of conceptual linkage, causal reasoning, and boundary principles.",
  },
];

export function ConceptualLearningSection() {
  const [activeSoloTab, setActiveSoloTab] = useState<number>(1); // Default to Multistructural

  return (
    <section
      id="progression"
      className="relative scroll-mt-20 border-t border-border/80 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Conceptual Taxonomy
            </div>

            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Grounded in the SOLO Taxonomy for genuine conceptual depth
            </h2>

            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              ATLAS departs fundamentally from traditional percentage-based grading.
              Assessment items are mapped to configured SOLO (Structure of Observed Learning Outcome) levels,
              gauging how deeply a student understands concepts rather than how many questions they guessed correctly.
            </p>
          </div>

          <div className="rounded-[16px] border border-border/80 bg-muted/30 p-5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Configured Curriculum Note:</span>{" "}
            The levels illustrated below (Unistructural → Multistructural → Relational) represent
            the configured progression deployed in the Electromagnetics pilot. ATLAS supports
            domain-specific pedagogical structures tailored to academic requirements.
          </div>
        </div>

        {/* Conceptual Hierarchy Flow & SOLO Interactive Explorer */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Column: The 5-Tier ATLAS Curricular Stack */}
          <div className="flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <ListTree className="size-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Curriculum Hierarchy Stack
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Top-Down Architecture
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {/* Level 1: Course */}
                <div className="flex items-center gap-3 rounded-[12px] border border-border/70 bg-background/80 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    01
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Course & Offering</p>
                    <p className="text-[11px] text-muted-foreground">
                      e.g., General Physics II: Electromagnetism (Academic Term)
                    </p>
                  </div>
                </div>

                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3.5 text-muted-foreground/60" />
                </div>

                {/* Level 2: Learning Objective */}
                <div className="flex items-center gap-3 rounded-[12px] border border-border/70 bg-background/80 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    02
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Learning Objectives</p>
                    <p className="text-[11px] text-muted-foreground">
                      Measurable goals defining qualitative and quantitative competence
                    </p>
                  </div>
                </div>

                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3.5 text-muted-foreground/60" />
                </div>

                {/* Level 3: Ordered Concepts */}
                <div className="flex items-center gap-3 rounded-[12px] border border-primary/30 bg-primary/5 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-primary text-[11px] font-mono font-bold text-primary-foreground">
                    03
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary">Ordered Concepts</p>
                    <p className="text-[11px] text-muted-foreground">
                      Structured pedagogical sequence (Coulomb&apos;s Law → Gauss&apos;s Law → Potential)
                    </p>
                  </div>
                </div>

                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3.5 text-muted-foreground/60" />
                </div>

                {/* Level 4: Configured SOLO Levels */}
                <div className="flex items-center gap-3 rounded-[12px] border border-border/70 bg-background/80 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    04
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">Configured SOLO Levels</p>
                    <p className="text-[11px] text-muted-foreground">
                      Unistructural, Multistructural, Relational cognitive milestones
                    </p>
                  </div>
                </div>

                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3.5 text-muted-foreground/60" />
                </div>

                {/* Level 5: Formative Assessment & Mastery */}
                <div className="flex items-center gap-3 rounded-[12px] border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-emerald-500 text-[11px] font-mono font-bold text-white">
                    05
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Formative Assessment & Mastery
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      MCQ & Essay evaluation → feedback → progression or review
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              Instructors retain full control over defining objectives, concepts, and assessment items.
            </div>
          </div>

          {/* Right Column: Interactive SOLO Level Taxonomy Explorer */}
          <div className="flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <Network className="size-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    SOLO Level Cognitive Depth
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Select a level to inspect
                </span>
              </div>

              {/* Tab selector */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {soloLevels.map((item, index) => {
                  const isActive = activeSoloTab === index;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setActiveSoloTab(index)}
                      className={`rounded-[12px] border p-2.5 text-center transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <p className="text-xs">{item.level}</p>
                      <p className="text-[10px] opacity-75 font-normal">Level {index + 1}</p>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Display */}
              <div className="mt-6 rounded-[16px] border border-border/80 bg-background/90 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {soloLevels[activeSoloTab].badge}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    SOLO Classification
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-foreground">
                  {soloLevels[activeSoloTab].level} Understanding
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {soloLevels[activeSoloTab].definition}
                </p>

                {/* Physics Example Sandbox */}
                <div className="mt-5 space-y-3 border-t border-border/70 pt-4">
                  <div className="rounded-[10px] bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      Domain Example (Electromagnetism):
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {soloLevels[activeSoloTab].physicsExample}
                    </p>
                  </div>

                  <div className="rounded-[10px] bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      Assessment Mechanism:
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {soloLevels[activeSoloTab].assessmentFocus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[12px] border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Pedagogical Value:</span>{" "}
              Ensures students transition from rote formula recall to qualitative structural synthesis.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
