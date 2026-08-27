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
            <Card className="flex h-full flex-col justify-between border border-border/80 bg-card shadow-xs transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="size-4.5 text-primary" />
                    <CardTitle className="text-base font-semibold">{t("video.title")}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">{t("video.badge")}</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div
                  onClick={() => setVideoModalOpen(!videoModalOpen)}
                  className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <PlayCircle className="size-7" />
                  </div>

                  <p className="mt-4 text-base font-semibold text-foreground">
                    {t("video.comingSoon")}
                  </p>

                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
                    {t("video.description")}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>{t("video.plannedRelease")}</span>
                  </div>

                  {videoModalOpen && (
                    <div className="mt-4 rounded-lg bg-background p-3 text-xs sm:text-sm text-primary font-medium border border-primary/20 animate-in fade-in">
                      {t("video.modalText")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Documentation Interactive List Card */}
          <ScrollReveal delayMs={200}>
            <Card className="flex h-full flex-col justify-between border border-border/80 bg-card shadow-xs transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4.5 text-primary" />
                    <CardTitle className="text-base font-semibold">{t("docs.title")}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">{t("docs.badge")}</Badge>
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
                      className={`cursor-pointer p-4 text-sm transition-colors ${
                        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm sm:text-base font-semibold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {guideTitle}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {guideDesc}
                          </p>
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"} className="shrink-0 text-xs">
                          {guideCategory}
                        </Badge>
                      </div>

                      {isSelected && (
                        <div className="mt-3 border-t border-border/60 pt-2.5 space-y-1.5 animate-in fade-in">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("docs.keyCoverage")}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.id === "getting-started" && [
                              t("guides.gettingStarted.highlights.0"),
                              t("guides.gettingStarted.highlights.1"),
                              t("guides.gettingStarted.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                                {h}
                              </span>
                            ))}
                            {guide.id === "taking-assessment" && [
                              t("guides.takingAssessment.highlights.0"),
                              t("guides.takingAssessment.highlights.1"),
                              t("guides.takingAssessment.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                                {h}
                              </span>
                            ))}
                            {guide.id === "understanding-solo" && [
                              t("guides.understandingSolo.highlights.0"),
                              t("guides.understandingSolo.highlights.1"),
                              t("guides.understandingSolo.highlights.2"),
                            ].map((h, i) => (
                              <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                                {h}
                              </span>
                            ))}
                            {guide.id === "reviewing-history" && [
                              t("guides.reviewingHistory.highlights.0"),
                              t("guides.reviewingHistory.highlights.1"),
                            ].map((h, i) => (
                              <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
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
        <div className="mt-16 space-y-4">
          <ScrollReveal>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("faq.title")}
              </h3>
              <p className="mt-1.5 text-base text-muted-foreground">
                {t("faq.description")}
              </p>
            </div>
          </ScrollReveal>

          {faqKeys.map((faqKey, idx) => (
            <ScrollReveal key={faqKey} delayMs={idx * 50}>
              <details className="group rounded-xl border border-border/80 bg-card/75 p-5 shadow-2xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/85 open:bg-card/85">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground outline-hidden select-none">
                  <span className="flex items-center gap-3.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span>{t(`faq.${faqKey}.question`)}</span>
                  </span>
                  <ChevronDown className="size-4.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>

                <div className="mt-3.5 pl-9.5 pr-2 text-sm sm:text-base leading-relaxed text-muted-foreground border-t border-border/60 pt-3.5">
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
