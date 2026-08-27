"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BookOpenText,
  Building2,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

interface TeamMember {
  name: string;
  roleKey: "student" | "supervisor1" | "supervisor2";
  affiliation: string;
  image?: string;
}

const team: TeamMember[] = [
  {
    name: "Firman Qashdus Sabil",
    roleKey: "student",
    affiliation: "Universitas Negeri Malang",
    image: "",
  },
  {
    name: "Khusaini, S.Pd., M.Ed., Ph.D.",
    roleKey: "supervisor1",
    affiliation: "Universitas Negeri Malang",
    image: "",
  },
  {
    name: "Dr. Cahyo Aji Hapsoro, M.Si.",
    roleKey: "supervisor2",
    affiliation: "Universitas Negeri Malang",
    image: "",
  },
];

export function ProjectSection() {
  const t = useTranslations("landing.project");

  return (
    <section
      id="team"
      className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* Anchor alias for backward compatibility */}
      <span id="project" className="absolute -top-16" aria-hidden="true" />

      <div className="mx-auto max-w-5xl space-y-16">
        {/* 1. Academic & Research Team */}
        <div>
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

          {/* Team Profile Cards with Photo Placeholder */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {team.map((member, idx) => (
              <ScrollReveal key={member.name} delayMs={idx * 100}>
                <Card className="flex h-full flex-col justify-between border border-border/80 bg-card/75 backdrop-blur-md shadow-xs transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-5">
                    {/* Photo / Avatar Placeholder (Ready for real image replacement) */}
                    <div className="relative mb-4 flex size-18 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/60 text-muted-foreground shadow-inner">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={72}
                          height={72}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                          <User className="size-9 text-primary/80" />
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-lg font-semibold leading-snug">
                      {member.name}
                    </CardTitle>

                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm font-medium">
                        {t(`roles.${member.roleKey}`)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 text-sm text-muted-foreground border-t border-border/60 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground/70" />
                      <span>{member.affiliation}</span>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* 2. Publication Status & List (Vertical Layout, Top-to-Down, Not in a Card) */}
        <div id="publication" className="scroll-mt-20 border-t border-border/70 pt-14">
          <ScrollReveal>
            <div className="flex flex-col gap-6">
              {/* Publication Header */}
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm">{t("publication.badge")}</Badge>
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {t("publication.title")}
                </h3>
                <p className="mt-1.5 text-base text-muted-foreground">
                  {t("publication.subtitle")}
                </p>
              </div>

              {/* Publication Item List (Solid Flat Soft Blue with Frosted Backdrop Blur) */}
              <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 backdrop-blur-md p-6 sm:p-7 shadow-xs">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    <BookOpenText className="size-6" />
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <h4 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
                      {t("publication.itemTitle")}
                    </h4>

                    <p className="text-sm sm:text-base font-medium text-foreground/90">
                      {t("publication.itemAuthors")}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant="secondary" className="bg-blue-100/90 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-0 text-xs sm:text-sm font-medium">
                        {t("publication.itemStatus")}
                      </Badge>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
                      {t("publication.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* 3. Funding (Center-aligned with Solid Flat Soft Blue container and Frosted Backdrop Blur) */}
        <div className="border-t border-border/70 pt-14">
          <ScrollReveal delayMs={100}>
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 backdrop-blur-md p-8 sm:p-10 text-center shadow-xs">
              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-blue-950 dark:text-blue-100">
                  {t("funding.title")}
                </h3>

                <div className="text-base sm:text-lg font-medium text-foreground">
                  <span>{t("funding.institution")}</span>
                  <span className="mx-2 text-muted-foreground/60 hidden sm:inline">·</span>
                  <span className="block sm:inline text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-0">
                    {t("funding.department")}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300">
                  {t("funding.type")}
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                  {t("funding.description")}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
