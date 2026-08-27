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
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-900 dark:text-blue-200 backdrop-blur-xs shadow-2xs">
                <span className="flex size-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>{t("badge")}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={150}>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("titlePrefix")}{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
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
                        className="rounded-full px-8 font-medium shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all hover:scale-[1.02]"
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
                          className="rounded-full px-8 font-medium shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all hover:scale-[1.02]"
                          nativeButton={false}
                          render={<Link href="/register" />}
                        >
                          {t("getStarted")}
                          <ArrowRight className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full px-7 font-medium border-border/80 hover:bg-muted/60 transition-all"
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
            {/* Colorful ambient backplate for mascot */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/15 to-sky-400/20 blur-3xl dark:from-blue-600/25 dark:via-indigo-600/20 dark:to-sky-500/20"
              aria-hidden="true"
            />
            <ScrollReveal delayMs={200} className="relative size-full flex items-center justify-center">
              <InteractiveMascot />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
