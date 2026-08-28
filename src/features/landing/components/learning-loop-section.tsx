"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  GraduationCap,
  MessageSquareText,
  RefreshCw,
  Repeat2,
  Sparkles,
} from "lucide-react";

interface LoopStep {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  icon: typeof Compass;
  badge: string;
}

export function LearningLoopSection() {
  const t = useTranslations("landing.learningLoop");
  const [selectedStep, setSelectedStep] = useState<string>("feedback");
  const mainLoopSteps: LoopStep[] = [
    {
      id: "target",
      stepNumber: "01",
      title: t("steps.target.title"),
      shortDesc: t("steps.target.shortDescription"),
      detailedDesc: t("steps.target.detailedDescription"),
      icon: Compass,
      badge: t("steps.target.badge"),
    },
    {
      id: "assessment",
      stepNumber: "02",
      title: t("steps.assessment.title"),
      shortDesc: t("steps.assessment.shortDescription"),
      detailedDesc: t("steps.assessment.detailedDescription"),
      icon: ClipboardList,
      badge: t("steps.assessment.badge"),
    },
    {
      id: "feedback",
      stepNumber: "03",
      title: t("steps.feedback.title"),
      shortDesc: t("steps.feedback.shortDescription"),
      detailedDesc: t("steps.feedback.detailedDescription"),
      icon: MessageSquareText,
      badge: t("steps.feedback.badge"),
    },
    {
      id: "mastery",
      stepNumber: "04",
      title: t("steps.mastery.title"),
      shortDesc: t("steps.mastery.shortDescription"),
      detailedDesc: t("steps.mastery.detailedDescription"),
      icon: CheckCircle2,
      badge: t("steps.mastery.badge"),
    },
    {
      id: "progression",
      stepNumber: "05",
      title: t("steps.progression.title"),
      shortDesc: t("steps.progression.shortDescription"),
      detailedDesc: t("steps.progression.detailedDescription"),
      icon: ArrowRight,
      badge: t("steps.progression.badge"),
    },
  ];

  const currentStepData =
    mainLoopSteps.find((s) => s.id === selectedStep) || mainLoopSteps[2];

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 border-t border-border/80 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
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

        {/* Interactive Linear Progression Pipeline */}
        <div className="mt-12">
          {/* Step selector bar (horizontal connected path on desktop, cards on mobile) */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {mainLoopSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = step.id === selectedStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSelectedStep(step.id)}
                  className={`group relative flex flex-col justify-between rounded-[14px] border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                      : "border-border/70 bg-card/60 hover:border-border hover:bg-card/90"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <div
                        className={`flex size-7 items-center justify-center rounded-[8px] ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                    </div>

                    <h3
                      className={`mt-3 text-sm font-semibold tracking-tight ${
                        isSelected
                          ? "text-foreground font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {step.shortDesc}
                    </p>
                  </div>

                  {idx < mainLoopSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20">
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Inspector */}
          <div className="mt-6 overflow-hidden rounded-[16px] border border-primary/20 bg-card/80 p-6 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary font-mono font-bold text-sm">
                  {currentStepData.stepNumber}
                </span>
                <div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {currentStepData.badge}
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>{t("interactiveStep")}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[1.4fr_1fr] items-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentStepData.detailedDesc}
              </p>

              <div className="rounded-[12px] border border-border/80 bg-muted/40 p-4 text-xs">
                <p className="font-semibold text-foreground">
                  {t("pedagogicalPurposeLabel")}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {t("pedagogicalPurpose")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Branching Dynamics: Non-Mastery & Review Paths */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Branch 1: Formative Recycling (Mastery not yet demonstrated) */}
          <div className="relative flex flex-col justify-between rounded-[18px] border border-border/80 bg-card/75 p-6 shadow-2xs backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                  <Repeat2 className="size-4.5" />
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {t("branches.adaptive.badge")}
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                {t("branches.adaptive.title")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("branches.adaptive.description")}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-[10px] bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5 text-primary" />
              <span>{t("branches.adaptive.footer")}</span>
            </div>
          </div>

          {/* Branch 2: Mastered Review Path */}
          <div className="relative flex flex-col justify-between rounded-[18px] border border-border/80 bg-card/75 p-6 shadow-2xs backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BookOpenCheck className="size-4.5" />
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {t("branches.retention.badge")}
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                {t("branches.retention.title")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("branches.retention.description")}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-[10px] bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("branches.retention.footer")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
