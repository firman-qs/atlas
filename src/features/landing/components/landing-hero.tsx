"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { InteractiveMascot } from "@/features/landing/components/interactive-mascot";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

export function LandingHero() {
  const t = useTranslations("landing.hero");
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Clear, High-Contrast Typography & CTA */}
          <div className="text-left lg:col-span-7">
            <ScrollReveal delayMs={50}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                <span className="flex size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>{t("badge")}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={150}>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("titlePrefix")}{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {t("titleHighlight")}
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delayMs={250}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("subtitle")}
              </p>
            </ScrollReveal>

            {/* Action Buttons */}
            <ScrollReveal delayMs={350}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <Button
                        size="lg"
                        className="rounded-full px-8 font-medium shadow-sm"
                        nativeButton={false}
                        render={<Link href="/dashboard" />}
                      >
                        {t("openDashboard")}
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          className="rounded-full px-8 font-medium shadow-sm"
                          nativeButton={false}
                          render={<Link href="/register" />}
                        >
                          {t("getStarted")}
                          <ArrowRight className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full px-7 font-medium"
                          nativeButton={false}
                          render={<Link href="/login" />}
                        >
                          {t("signIn")}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: 3D Hardware-Accelerated ATLAS Mascot */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            <ScrollReveal delayMs={200} className="relative size-full flex items-center justify-center">
              <InteractiveMascot />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
