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
import { useTranslations } from "next-intl";

export function CapabilitiesSection() {
  const t = useTranslations("landing.authoredCapabilities");

  return (
    <section
      id="capabilities"
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

        {/* 3 Major Authored Pillars */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {/* Pillar 1: Structured Learning */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  {t("pillars.structured.number")}
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <GitBranch className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                {t("pillars.structured.title")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("pillars.structured.description")}
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.structured.features.progression.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.structured.features.progression.description")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.structured.features.assessment.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.structured.features.assessment.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t("pillars.structured.footerLabel")}
              </span>{" "}
              {t("pillars.structured.footerText")}
            </div>
          </div>

          {/* Pillar 2: Feedback & Evaluation */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  {t("pillars.feedback.number")}
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <MessageSquareQuote className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                {t("pillars.feedback.title")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("pillars.feedback.description")}
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.feedback.features.essay.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.feedback.features.essay.description")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.feedback.features.formative.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.feedback.features.formative.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t("pillars.feedback.footerLabel")}
              </span>{" "}
              {t("pillars.feedback.footerText")}
            </div>
          </div>

          {/* Pillar 3: Learning Context & Evidence */}
          <div className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-card/75 p-6 shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  {t("pillars.evidence.number")}
                </span>
                <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <FileCheck2 className="size-5" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
                {t("pillars.evidence.title")}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("pillars.evidence.description")}
              </p>

              <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.evidence.features.assistance.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.evidence.features.assistance.description")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {t("pillars.evidence.features.inspectable.title")}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pillars.evidence.features.inspectable.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[12px] border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t("pillars.evidence.footerLabel")}
              </span>{" "}
              {t("pillars.evidence.footerText")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
