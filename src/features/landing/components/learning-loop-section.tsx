"use client";

import { useState } from "react";
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

const mainLoopSteps: LoopStep[] = [
  {
    id: "target",
    stepNumber: "01",
    title: "Select Learning Target",
    shortDesc: "Focus on a learning objective and its ordered concept.",
    detailedDesc:
      "The student enters an active course offering and selects a specific learning objective (e.g. Electric Fields and Forces) along its defined sequence of ordered concepts.",
    icon: Compass,
    badge: "Curriculum Anchor",
  },
  {
    id: "assessment",
    stepNumber: "02",
    title: "Formative Assessment",
    shortDesc: "Engage with MCQ or open-ended essay questions.",
    detailedDesc:
      "ATLAS presents diagnostic formative items calibrated to the student's current configured conceptual level (e.g., Unistructural, Multistructural, or Relational).",
    icon: ClipboardList,
    badge: "Active Inquiry",
  },
  {
    id: "feedback",
    stepNumber: "03",
    title: "Receive Diagnostic Feedback",
    shortDesc: "Analyze qualitative insights and conceptual explanations.",
    detailedDesc:
      "Rather than a bare numerical score, the student receives targeted feedback explaining the physical reasoning behind their answers and highlighting any misconceptions.",
    icon: MessageSquareText,
    badge: "Formative Dialogue",
  },
  {
    id: "mastery",
    stepNumber: "04",
    title: "Demonstrate Mastery",
    shortDesc: "Show robust conceptual understanding at the current level.",
    detailedDesc:
      "When the student's responses demonstrate comprehensive alignment with the criteria for the current SOLO level, mastery is registered.",
    icon: CheckCircle2,
    badge: "Verification",
  },
  {
    id: "progression",
    stepNumber: "05",
    title: "Progress Deeper",
    shortDesc: "Advance to deeper SOLO levels or subsequent concepts.",
    detailedDesc:
      "The student advances along the learning trajectory to the next configured SOLO level (e.g., Relational) or transitions to the next ordered concept in the syllabus.",
    icon: ArrowRight,
    badge: "Advancement",
  },
];

export function LearningLoopSection() {
  const [selectedStep, setSelectedStep] = useState<string>("feedback");

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
            Pedagogical Architecture
          </div>

          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How ATLAS works: The formative learning loop
          </h2>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            A continuous, evidence-grounded cycle of targeted inquiry, diagnostic feedback,
            and conceptual progression.
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
                        isSelected ? "text-foreground font-bold" : "text-foreground"
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
                <span>Interactive Learning Step</span>
              </div>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[1.4fr_1fr] items-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentStepData.detailedDesc}
              </p>

              <div className="rounded-[12px] border border-border/80 bg-muted/40 p-4 text-xs">
                <p className="font-semibold text-foreground">Pedagogical Purpose:</p>
                <p className="mt-1 text-muted-foreground">
                  Ensures students receive immediate formative interventions before misconceptions solidify into higher-level learning stages.
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
                  Adaptive Branch
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                When Mastery is Not Yet Demonstrated
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rather than penalizing with a permanent low grade, ATLAS initiates
                another formative cycle. The student is offered contextual feedback,
                guided reflection, and alternative formative questions to strengthen their conceptual grounding.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-[10px] bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5 text-primary" />
              <span>Assessment is treated as an iterative opportunity for learning.</span>
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
                  Retention Branch
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                Reviewing Mastered Material
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Students can revisit previously mastered concepts at any time through review assessments.
                Engaging in review practice reinforces long-term conceptual retention without disrupting the student&apos;s established mastery record.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-[10px] bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Safe review environment that preserves demonstrated achievements.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
