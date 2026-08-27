"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpenText,
  Building2,
  GraduationCap,
  Landmark,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

interface TeamMember {
  name: string;
  roleKey: "creator" | "supervisor";
  bioKey: "firman" | "khusaini" | "cahyo";
  affiliation: string;
  icon: typeof UserCheck | typeof GraduationCap;
}

const team: TeamMember[] = [
  {
    name: "Firman Qashdus Sabil",
    roleKey: "creator",
    bioKey: "firman",
    affiliation: "Universitas Negeri Malang",
    icon: UserCheck,
  },
  {
    name: "Khusaini, S.Pd., M.Ed., Ph.D.",
    roleKey: "supervisor",
    bioKey: "khusaini",
    affiliation: "Universitas Negeri Malang",
    icon: GraduationCap,
  },
  {
    name: "Dr. Cahyo Aji Hapsoro, M.Si.",
    roleKey: "supervisor",
    bioKey: "cahyo",
    affiliation: "Universitas Negeri Malang",
    icon: GraduationCap,
  },
];

export function ProjectSection() {
  const t = useTranslations("landing.project");
  const [activeMember, setActiveMember] = useState<string | null>(null);

  return (
    <section id="project" className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
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

        {/* Project Team Cards */}
        <div className="mt-12">
          <div className="grid gap-4 md:grid-cols-3">
            {team.map((member, idx) => {
              const Icon = member.icon;
              const isSelected = activeMember === member.name;

              return (
                <ScrollReveal key={member.name} delayMs={idx * 100}>
                  <Card
                    onClick={() => setActiveMember(isSelected ? null : member.name)}
                    className={`cursor-pointer flex h-full flex-col justify-between border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 ${
                      isSelected ? "ring-1 ring-primary border-primary bg-primary/10" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <CardTitle className="mt-3 text-base font-semibold">
                        {member.name}
                      </CardTitle>

                      <CardDescription className="text-xs font-medium text-primary">
                        {t(`roles.${member.roleKey}`)}
                      </CardDescription>

                      {isSelected && (
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed animate-in fade-in">
                          {t(`bios.${member.bioKey}`)}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/60 p-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground/70" />
                        <span>{member.affiliation}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {isSelected ? t("clickToCollapse") : t("clickForBio")}
                      </span>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Funding & Publication Dual Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Funding Card */}
          <ScrollReveal delayMs={150}>
            <Card className="h-full border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Landmark className="size-4.5" />
                  </div>
                  <Badge variant="secondary">{t("funding.badge")}</Badge>
                </div>

                <CardTitle className="mt-2 text-base font-semibold">
                  {t("funding.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("funding.institution")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{t("funding.type")}</p>
                <p>{t("funding.description")}</p>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Publication Card */}
          <ScrollReveal delayMs={250}>
            <Card id="publication" className="scroll-mt-16 h-full border border-border/80 bg-card/75 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpenText className="size-4.5" />
                  </div>
                  <Badge variant="outline">{t("publication.badge")}</Badge>
                </div>

                <CardTitle className="mt-2 text-base font-semibold">
                  {t("publication.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("publication.subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{t("publication.type")}</p>
                <p>{t("publication.description")}</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
