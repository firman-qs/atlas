import {
  BookMarked,
  BrainCircuit,
  CheckCircle,
  Clock,
  FileCheck2,
  GitBranch,
  Layers,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative scroll-mt-20 border-t border-border/80 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Platform Capabilities
          </div>

          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Authored for academic depth and conceptual clarity
          </h2>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            ATLAS unites curriculum hierarchy, formative assessment, diagnostic feedback,
            and contextual AI assistance into an integrated educational architecture.
          </p>
        </div>

        {/* 3 Major Authored Pillars */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {/* Pillar 1: Structured Learning */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Pillar 01
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <GitBranch className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                Structured Learning
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Learning is not a random collection of quiz questions. Curriculum is structured
                into clear hierarchies that reflect true pedagogical sequence.
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Conceptual Progression
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Ordered concepts grouped under defined learning objectives, guiding students from foundational to nuanced understanding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Adaptive Formative Assessment
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Presents formative items targeted at the student&apos;s current conceptual level rather than arbitrary testing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Hierarchical Flow:</span>{" "}
              Course Offering → Learning Objectives → Ordered Concepts → Configured SOLO levels.
            </div>
          </div>

          {/* Pillar 2: Feedback & Evaluation */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Pillar 02
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <MessageSquareQuote className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                Feedback & Evaluation
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Assessment is designed for learning, not merely grading. Feedback illuminates
                underlying reasoning and directly addresses misconceptions.
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      AI-Supported Essay Evaluation
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Evaluates open-ended qualitative explanations, identifying conceptual alignment and specific omissions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Meaningful Formative Feedback
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Delivers timely explanations that explain why an answer is incomplete and prompt the next conceptual insight.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Dual Item Formats:</span>{" "}
              Diagnostic Multiple-Choice Questions (MCQ) & Qualitative Essay inquiries.
            </div>
          </div>

          {/* Pillar 3: Learning Context & Evidence */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Pillar 03
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <FileCheck2 className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                Context & Evidence
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                All learning interactions remain grounded in instructor-curated materials, preserving full transparency and inspectable evidence.
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Course-Grounded Assistance
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      An AI learning assistant anchored directly in course materials, preventing hallucinations and preserving pedagogical fidelity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Inspectable Learning Evidence
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Complete attempt histories, progression traces, and diagnostic evaluations remain auditable for students and instructors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Academic Integrity:</span>{" "}
              Transparent audit logs with no opaque scoring algorithms or black-box predictions.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
