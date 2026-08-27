"use client";

import { useState } from "react";
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

const studentFeatures: RoleFeature[] = [
  {
    title: "Inspect Learning Progress",
    desc: "View current status across all learning objectives, ordered concepts, and demonstrated SOLO levels.",
    icon: BarChart3,
  },
  {
    title: "Complete Formative Assessments",
    desc: "Answer calibrated multiple-choice items and write qualitative essay responses for ongoing evaluation.",
    icon: CheckCircle,
  },
  {
    title: "Receive Diagnostic Feedback",
    desc: "Access formative feedback that explains underlying physical principles and guides conceptual refinement.",
    icon: MessageSquareCheck,
  },
  {
    title: "Revisit Mastered Material",
    desc: "Take review assessments on previously mastered concepts to strengthen retention without altering mastery records.",
    icon: RotateCcw,
  },
  {
    title: "Inspect Assessment Evidence",
    desc: "Audit prior assessment attempts, submitted essays, and feedback records for continuous self-reflection.",
    icon: History,
  },
  {
    title: "Course-Grounded Learning Assistant",
    desc: "Interact with an AI assistant strictly grounded in the instructor's syllabus and verified course materials.",
    icon: Bot,
  },
];

const instructorFeatures: RoleFeature[] = [
  {
    title: "Organize Learning Structures",
    desc: "Define course offerings, articulate learning objectives, and configure pedagogical concept sequences.",
    icon: Layers,
  },
  {
    title: "Manage Formative Material",
    desc: "Author and curate formative items mapped directly to configured SOLO levels and cognitive outcomes.",
    icon: FileCheck2,
  },
  {
    title: "Manage Question Banks",
    desc: "Organize, import, and maintain diagnostic MCQ and essay question repositories per course offering.",
    icon: Database,
  },
  {
    title: "Observe Student Progression",
    desc: "Track student conceptual trajectories, identifying common learning obstacles across cohort offerings.",
    icon: Eye,
  },
  {
    title: "Inspect Assessment Evidence",
    desc: "Review detailed student attempts, submitted qualitative essays, and AI evaluation traces for assessment integrity.",
    icon: Archive,
  },
];

export function PerspectivesSection() {
  const [activeRole, setActiveRole] = useState<"student" | "instructor">("student");

  return (
    <section
      id="perspectives"
      className="relative scroll-mt-20 border-t border-border/80 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Educational Perspectives
          </div>

          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Designed for students and instructors
          </h2>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            ATLAS provides specialized interfaces tailored to the distinct workflows of learners
            and educators while maintaining a shared, auditable evidence base.
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
            Student Perspective
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
            Instructor Perspective
          </button>
        </div>

        {/* Dynamic Role Capability Grid */}
        <div className="mt-8">
          <div className="rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-2 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  {activeRole === "student" ? "Learner Environment" : "Educator Environment"}
                </span>
                <h3 className="text-xl font-bold text-foreground">
                  {activeRole === "student"
                    ? "Interactive formative learning & self-monitoring"
                    : "Curriculum governance & progression observation"}
                </h3>
              </div>

              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground self-start sm:self-auto">
                {activeRole === "student" ? "6 Primary Functions" : "5 Primary Functions"}
              </span>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(activeRole === "student" ? studentFeatures : instructorFeatures).map(
                (feature) => {
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
                          Validated Workflow
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
