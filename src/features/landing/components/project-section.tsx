"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BookOpenText,
  Building2,
  Landmark,
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
                <Card className="flex h-full flex-col justify-between border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <CardHeader className="pb-5">
                    {/* Photo / Avatar Placeholder (Ready for real image replacement) */}
                    <div className="relative mb-4 flex size-18 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted/60 text-muted-foreground shadow-inner">
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
                      <Badge variant="secondary" className="text-xs sm:text-sm font-medium text-primary">
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

              {/* Publication Item List */}
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-7 backdrop-blur-xs">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs sm:text-sm font-medium text-primary">
                        {t("publication.itemStatus")}
                      </span>
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

        {/* 3. Funding Acknowledgement (Vertical Layout Below Publication, Not in a Card) */}
        <div className="border-t border-border/70 pt-14">
          <ScrollReveal delayMs={100}>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Landmark className="size-4.5" />
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm">{t("funding.badge")}</Badge>
              </div>

              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("funding.title")}
              </h3>

              <div className="text-base font-medium text-foreground">
                {t("funding.institution")}
                <span className="mx-2 text-muted-foreground/60">·</span>
                <span className="text-sm font-normal text-muted-foreground">{t("funding.department")}</span>
              </div>

              <p className="text-sm font-medium text-primary">
                {t("funding.type")}
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-3xl">
                {t("funding.description")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
