"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, BookOpen, ListTree, Network, Sparkles } from "lucide-react";

export function ConceptualLearningSection() {
  const t = useTranslations("landing.conceptualLearning");
  const [activeSoloTab, setActiveSoloTab] = useState<number>(1); // Default to Multistructural
  const soloLevels = [
    {
      id: "unistructural",
      level: t("soloLevels.unistructural.level"),
      badge: t("soloLevels.unistructural.badge"),
      definition: t("soloLevels.unistructural.definition"),
      physicsExample: t("soloLevels.unistructural.physicsExample"),
      assessmentFocus: t("soloLevels.unistructural.assessmentFocus"),
    },
    {
      id: "multistructural",
      level: t("soloLevels.multistructural.level"),
      badge: t("soloLevels.multistructural.badge"),
      definition: t("soloLevels.multistructural.definition"),
      physicsExample: t("soloLevels.multistructural.physicsExample"),
      assessmentFocus: t("soloLevels.multistructural.assessmentFocus"),
    },
    {
      id: "relational",
      level: t("soloLevels.relational.level"),
      badge: t("soloLevels.relational.badge"),
      definition: t("soloLevels.relational.definition"),
      physicsExample: t("soloLevels.relational.physicsExample"),
      assessmentFocus: t("soloLevels.relational.assessmentFocus"),
    },
  ];

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
              {t("badge")}
            </div>

            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>

            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="rounded-[16px] border border-border/80 bg-muted/30 p-5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t("curriculumNoteLabel")}
            </span>{" "}
            {t("curriculumNote")}
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
                    {t("hierarchy.title")}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {t("hierarchy.subtitle")}
                </span>
              </div>

              <div className="mt-5 space-y-2.5">
                {/* Level 1: Course */}
                <div className="flex items-center gap-3 rounded-[12px] border border-border/70 bg-background/80 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    01
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">
                      {t("hierarchy.course.title")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("hierarchy.course.description")}
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
                    <p className="text-xs font-bold text-foreground">
                      {t("hierarchy.objectives.title")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("hierarchy.objectives.description")}
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
                    <p className="text-xs font-bold text-primary">
                      {t("hierarchy.concepts.title")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("hierarchy.concepts.description")}
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
                    <p className="text-xs font-bold text-foreground">
                      {t("hierarchy.solo.title")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("hierarchy.solo.description")}
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
                      {t("hierarchy.assessment.title")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("hierarchy.assessment.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              {t("hierarchy.footer")}
            </div>
          </div>

          {/* Right Column: Interactive SOLO Level Taxonomy Explorer */}
          <div className="flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <Network className="size-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    {t("explorer.title")}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t("explorer.subtitle")}
                </span>
              </div>

              {/* Tab selector */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {soloLevels.map((item, index) => {
                  const isActive = activeSoloTab === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSoloTab(index)}
                      className={`rounded-[12px] border p-2.5 text-center transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <p className="text-xs">{item.level}</p>
                      <p className="text-[10px] opacity-75 font-normal">
                        {t("explorer.level", { level: index + 1 })}
                      </p>
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
                    {t("explorer.classification")}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-foreground">
                  {t("explorer.understanding", {
                    level: soloLevels[activeSoloTab].level,
                  })}
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {soloLevels[activeSoloTab].definition}
                </p>

                {/* Physics Example Sandbox */}
                <div className="mt-5 space-y-3 border-t border-border/70 pt-4">
                  <div className="rounded-[10px] bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      {t("explorer.domainExample")}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {soloLevels[activeSoloTab].physicsExample}
                    </p>
                  </div>

                  <div className="rounded-[10px] bg-muted/40 p-3 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary" />
                      {t("explorer.assessmentMechanism")}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {soloLevels[activeSoloTab].assessmentFocus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[12px] border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t("explorer.pedagogicalValueLabel")}
              </span>{" "}
              {t("explorer.pedagogicalValue")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
