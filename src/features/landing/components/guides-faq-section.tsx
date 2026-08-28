"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  Clock,
  FileText,
  PlayCircle,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

interface GuideItem {
  id: string;
  titleKey: "gettingStarted" | "takingAssessment" | "understandingSolo" | "reviewingHistory" | "learningAssistant" | "instructorWorkflow";
  categoryKey: "student" | "instructor" | "conceptual";
}

const upcomingGuides: GuideItem[] = [
  {
    id: "getting-started",
    titleKey: "gettingStarted",
    categoryKey: "student",
  },
  {
    id: "taking-assessment",
    titleKey: "takingAssessment",
    categoryKey: "student",
  },
  {
    id: "understanding-solo",
    titleKey: "understandingSolo",
    categoryKey: "conceptual",
  },
  {
    id: "reviewing-history",
    titleKey: "reviewingHistory",
    categoryKey: "student",
  },
  {
    id: "learning-assistant",
    titleKey: "learningAssistant",
    categoryKey: "student",
  },
  {
    id: "instructor-workflow",
    titleKey: "instructorWorkflow",
    categoryKey: "instructor",
  },
];

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const;

export function GuidesFaqSection() {
  const t = useTranslations("landing.guidesFaq");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("getting-started");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section id="guides-faq" className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            {t("badge")}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>

          <p className="mt-3 text-base text-muted-foreground">
            {t("description")}
          </p>
        </ScrollReveal>

        {/* Top: Video Guides and Documentation Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Video Guides Card */}
          <ScrollReveal delayMs={100}>
            <Card className="flex h-full flex-col justify-between border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">{t("video.title")}</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("video.badge")}</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div
                  onClick={() => setVideoModalOpen(!videoModalOpen)}
                  className="group cursor-pointer flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-muted/40 backdrop-blur-xs hover:bg-muted/60 transition-colors"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <PlayCircle className="size-6" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {t("video.comingSoon")}
                  </p>

                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    {t("video.description")}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{t("video.plannedRelease")}</span>
                  </div>

                  {videoModalOpen && (
                    <div className="mt-4 rounded-md bg-background/90 backdrop-blur-xs p-2.5 text-[11px] text-primary font-medium border border-primary/20 animate-in fade-in">
                      {t("video.modalText")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Documentation Interactive List Card */}
          <ScrollReveal delayMs={200}>
            <Card className="flex h-full flex-col justify-between border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">{t("docs.title")}</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("docs.badge")}</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-border/60">
                {upcomingGuides.slice(0, 4).map((guide) => {
                  const isSelected = selectedGuideId === guide.id;
                  const guideTitle = t(`guides.${guide.titleKey}.title`);
                  const guideDesc = t(`guides.${guide.titleKey}.description`);
                  const guideCategory = t(`categories.${guide.categoryKey}`);

                  return (
                    <div
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      className={`cursor-pointer p-3.5 text-xs transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {guideTitle}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {guideDesc}
                          </p>
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"} className="shrink-0 text-[10px]">
                          {guideCategory}
                        </Badge>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 border-t border-border/60 pt-2 space-y-1 animate-in fade-in">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">{t("docs.keyCoverage")}</p>
                          <div className="flex flex-wrap gap-1">
                            {guide.id === "getting-started" && [
                              t("guides.gettingStarted.highlights.0"),
                              t("guides.gettingStarted.highlights.1"),
                              t("guides.gettingStarted.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {h}
                              </span>
                            ))}
                            {guide.id === "taking-assessment" && [
                              t("guides.takingAssessment.highlights.0"),
                              t("guides.takingAssessment.highlights.1"),
                              t("guides.takingAssessment.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {h}
                              </span>
                            ))}
                            {guide.id === "understanding-solo" && [
                              t("guides.understandingSolo.highlights.0"),
                              t("guides.understandingSolo.highlights.1"),
                              t("guides.understandingSolo.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {h}
                              </span>
                            ))}
                            {guide.id === "reviewing-history" && [
                              t("guides.reviewingHistory.highlights.0"),
                              t("guides.reviewingHistory.highlights.1"),
                            ].map((h, i) => (
                              <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Bottom: FAQ Section */}
        <div className="mt-14 space-y-3">
          <ScrollReveal>
            <div className="mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {t("faq.title")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("faq.description")}
              </p>
            </div>
          </ScrollReveal>

          {faqKeys.map((faqKey, idx) => (
            <ScrollReveal key={faqKey} delayMs={idx * 50}>
              <details className="group rounded-xl border border-border/80 bg-card/75 p-4 shadow-2xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/85 open:bg-card/85">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground outline-hidden select-none">
                  <span className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span>{t(`faq.${faqKey}.question`)}</span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>

                <div className="mt-3 pl-8 pr-2 text-xs leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                  {t(`faq.${faqKey}.answer`)}
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
