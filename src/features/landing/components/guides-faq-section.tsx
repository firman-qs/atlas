"use client";

import { useState } from "react";
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
  title: string;
  category: "Student" | "Instructor" | "Conceptual";
  description: string;
  highlights: string[];
}

const upcomingGuides: GuideItem[] = [
  {
    id: "getting-started",
    title: "Getting started with ATLAS",
    category: "Student",
    description: "Orientation to course offerings, dashboard navigation, and learning objectives.",
    highlights: ["Enrollment access", "Active assessment discovery", "Mastery indicators"],
  },
  {
    id: "taking-assessment",
    title: "Taking a formative assessment",
    category: "Student",
    description: "Responding to calibrated MCQ items and drafting qualitative conceptual essays.",
    highlights: ["Interactive equation inputs", "No punitive penalties", "Direct diagnostic hints"],
  },
  {
    id: "understanding-solo",
    title: "Understanding conceptual progression",
    category: "Conceptual",
    description: "How ordered concepts and configured SOLO levels structure your learning path.",
    highlights: ["Unistructural $\\to$ Multistructural $\\to$ Relational", "Mastery thresholds", "Review mode"],
  },
  {
    id: "reviewing-history",
    title: "Reviewing assessment history and feedback",
    category: "Student",
    description: "Navigating past submissions, diagnostic feedback, and review assessment modes.",
    highlights: ["Retrying completed concepts safely", "Auditing qualitative feedback traces"],
  },
  {
    id: "learning-assistant",
    title: "Using the ATLAS learning assistant",
    category: "Student",
    description: "Asking course-grounded conceptual questions without receiving unsolicited answers.",
    highlights: ["Strict curriculum grounding", "Socratic prompting", "Chapter citations"],
  },
  {
    id: "instructor-workflow",
    title: "Instructor curriculum and assessment workflow",
    category: "Instructor",
    description: "Authoring objectives, organizing question banks, and observing cohort progression.",
    highlights: ["JSON curriculum imports", "Taxonomy level binding", "Cohort telemetry"],
  },
];

const faqs = [
  {
    question: "What is ATLAS?",
    answer:
      "ATLAS (Atlas, Targeted Learning Assessment System) is an academic educational platform for AI-supported adaptive formative assessment. It structures curricula around learning objectives, ordered concepts, and configured SOLO levels to evaluate conceptual mastery and provide diagnostic learning feedback.",
  },
  {
    question: "How does formative progression work?",
    answer:
      "Students engage with formative assessments containing Multiple-Choice Questions (MCQ) and qualitative essays at their current conceptual level. When responses demonstrate sufficient conceptual understanding for that configured SOLO level (such as Unistructural or Multistructural), the student advances deeper along the trajectory.",
  },
  {
    question: "What happens if mastery is not yet demonstrated?",
    answer:
      "If a student does not yet demonstrate mastery at their current level, ATLAS initiates another formative cycle. The student receives targeted diagnostic feedback explaining relevant principles and misconceptions, followed by additional formative practice opportunities rather than a punitive terminal grade.",
  },
  {
    question: "Can previously mastered material be reviewed?",
    answer:
      "Yes. Students can freely revisit previously mastered concepts through review assessments. Review sessions provide ongoing retrieval practice and reinforce long-term conceptual retention without altering the student's recorded mastery status.",
  },
  {
    question: "How is AI used in ATLAS?",
    answer:
      "AI supports educational functions where pedagogically appropriate: performing formative evaluation of open-ended essay explanations, generating contextual diagnostic feedback, and powering a learning assistant strictly grounded in the course curriculum and verified learning context.",
  },
  {
    question: "What types of assessment questions are supported?",
    answer:
      "ATLAS currently supports diagnostic Multiple-Choice Questions (MCQ) and open-ended qualitative Essay questions, enabling both rapid conceptual verification and deep qualitative reasoning.",
  },
  {
    question: "Does ATLAS replace instructors?",
    answer:
      "No. ATLAS is designed as a formative tool to assist educators and students. Instructors define the learning objectives, organize concepts, curate question banks, and maintain full oversight over cohort progression and assessment evidence.",
  },
];

export function GuidesFaqSection() {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("getting-started");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section id="guides-faq" className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            Resources & Reference
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Guides & Frequently Asked Questions
          </h2>

          <p className="mt-3 text-base text-muted-foreground">
            Explore forthcoming video walkthroughs, documentation outlines, and answers
            regarding the ATLAS formative learning methodology.
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
                    <CardTitle className="text-sm font-semibold">Video Guides</CardTitle>
                  </div>
                  <Badge variant="secondary">Forthcoming</Badge>
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
                    Video Guides Coming Soon
                  </p>

                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Curated walkthroughs covering student onboarding and instructor curriculum authoring are in production.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Planned release with pilot phase</span>
                  </div>

                  {videoModalOpen && (
                    <div className="mt-4 rounded-md bg-background/90 backdrop-blur-xs p-2.5 text-[11px] text-primary font-medium border border-primary/20 animate-in fade-in">
                      Walkthrough recordings are currently being recorded for the Electromagnetics pilot cohort.
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
                    <CardTitle className="text-sm font-semibold">Documentation Topics</CardTitle>
                  </div>
                  <Badge variant="secondary">Interactive Outlines</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-border/60">
                {upcomingGuides.slice(0, 4).map((guide) => {
                  const isSelected = selectedGuideId === guide.id;

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
                            {guide.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {guide.description}
                          </p>
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"} className="shrink-0 text-[10px]">
                          {guide.category}
                        </Badge>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 border-t border-border/60 pt-2 space-y-1 animate-in fade-in">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Key Coverage:</p>
                          <div className="flex flex-wrap gap-1">
                            {guide.highlights.map((h, i) => (
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
                Frequently Asked Questions
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Direct answers regarding ATLAS formative mechanics, AI evaluation, and learning evidence.
              </p>
            </div>
          </ScrollReveal>

          {faqs.map((faq, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 50}>
              <details className="group rounded-xl border border-border/80 bg-card/75 p-4 shadow-2xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/85 open:bg-card/85">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground outline-hidden select-none">
                  <span className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>

                <div className="mt-3 pl-8 pr-2 text-xs leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                  {faq.answer}
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
