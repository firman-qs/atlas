"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle,
  Database,
  Eye,
  FileCheck2,
  GraduationCap,
  History,
  Layers,
  MessageSquareCheck,
  RotateCcw,
} from "lucide-react";

interface RoleFeature {
  title: string;
  desc: string;
  icon: typeof GraduationCap;
}

export function PerspectivesSection() {
  const t = useTranslations("landing.perspectives");
  const [activeRole, setActiveRole] = useState<"student" | "instructor">(
    "student",
  );
  const studentFeatures: RoleFeature[] = [
    {
      title: t("student.features.progress.title"),
      desc: t("student.features.progress.description"),
      icon: BarChart3,
    },
    {
      title: t("student.features.assessments.title"),
      desc: t("student.features.assessments.description"),
      icon: CheckCircle,
    },
    {
      title: t("student.features.feedback.title"),
      desc: t("student.features.feedback.description"),
      icon: MessageSquareCheck,
    },
    {
      title: t("student.features.review.title"),
      desc: t("student.features.review.description"),
      icon: RotateCcw,
    },
    {
      title: t("student.features.evidence.title"),
      desc: t("student.features.evidence.description"),
      icon: History,
    },
    {
      title: t("student.features.assistant.title"),
      desc: t("student.features.assistant.description"),
      icon: Bot,
    },
  ];
  const instructorFeatures: RoleFeature[] = [
    {
      title: t("instructor.features.structures.title"),
      desc: t("instructor.features.structures.description"),
      icon: Layers,
    },
    {
      title: t("instructor.features.material.title"),
      desc: t("instructor.features.material.description"),
      icon: FileCheck2,
    },
    {
      title: t("instructor.features.banks.title"),
      desc: t("instructor.features.banks.description"),
      icon: Database,
    },
    {
      title: t("instructor.features.progress.title"),
      desc: t("instructor.features.progress.description"),
      icon: Eye,
    },
    {
      title: t("instructor.features.evidence.title"),
      desc: t("instructor.features.evidence.description"),
      icon: Archive,
    },
  ];

  return (
    <section
      id="perspectives"
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

        {/* Role Toggle Switcher */}
        <div className="mt-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveRole("student")}
            className={`flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-xs font-semibold transition-all ${
              activeRole === "student"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border/80 bg-card/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <GraduationCap className="size-4" />
            {t("student.toggle")}
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("instructor")}
            className={`flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-xs font-semibold transition-all ${
              activeRole === "instructor"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border/80 bg-card/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BrainCircuit className="size-4" />
            {t("instructor.toggle")}
          </button>
        </div>

        {/* Dynamic Role Capability Grid */}
        <div className="mt-8">
          <div className="rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-2 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  {activeRole === "student"
                    ? t("student.environment")
                    : t("instructor.environment")}
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {activeRole === "student"
                    ? t("student.heading")
                    : t("instructor.heading")}
                </h3>
              </div>

              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground self-start sm:self-auto">
                {t("primaryFunctions", {
                  count: activeRole === "student" ? 6 : 5,
                })}
              </span>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(activeRole === "student"
                ? studentFeatures
                : instructorFeatures
              ).map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group relative flex flex-col justify-between rounded-[14px] border border-border/60 bg-background/80 p-5 transition-all hover:border-primary/40 hover:bg-background"
                  >
                    <div>
                      <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                      </div>

                      <h4 className="mt-4 text-sm font-bold text-foreground">
                        {feature.title}
                      </h4>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-border/40 pt-3">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="size-3 text-primary" />
                        {t("validatedWorkflow")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
