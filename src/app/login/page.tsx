"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sparkles, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { AuthMascot, type AuthMascotExpression } from "@/features/auth/components/auth-mascot";
import { useAuth } from "@/features/auth/auth-provider";
import { LoginForm } from "@/features/auth/login-form";

function ThemeToggle() {
  const tHeader = useTranslations("landing.header");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={tHeader("themeToggleAria")}
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const { isAuthenticated, isLoading } = useAuth();
  const [mascotExpression, setMascotExpression] = useState<AuthMascotExpression>("idle");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-background">
      {/* Dynamic Ambient Background Glow Elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 -translate-x-1/2 size-[650px] rounded-full bg-radial from-cyan-400/20 via-blue-500/10 to-transparent blur-3xl opacity-75 dark:from-cyan-500/15 dark:via-blue-600/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/4 translate-x-1/2 size-[600px] rounded-full bg-radial from-blue-500/15 via-indigo-600/10 to-transparent blur-3xl opacity-60 dark:from-blue-500/10 dark:via-indigo-600/5"
      />

      {/* Top Header Navigation */}
      <header className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Back to Home */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
            >
              <Image
                src="/logo.png"
                alt="ATLAS Logo"
                width={32}
                height={32}
                priority
                className="size-8 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                ATLAS
              </span>
            </Link>

            <div className="hidden h-4 w-px bg-border/80 sm:block" />

            <Link
              href="/"
              className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t("backToHome")}</span>
            </Link>
          </div>

          {/* Quick Actions (Language & Theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Showcase & Form */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Left Column: 3D ATLAS Interactive Mascot & Conceptual AI Showcase (Desktop) */}
          <div className="hidden lg:col-span-6 lg:flex lg:flex-col lg:items-start lg:text-left">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Sparkles className="size-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{t("showcaseBadge")}</span>
            </div>

            {/* Headline */}
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl xl:text-5xl">
              {t("showcaseTitle")}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              {t("showcaseSubtitle")}
            </p>

            {/* Interactive Reactive Mascot */}
            <div className="my-6 w-full flex justify-center lg:justify-start">
              <AuthMascot
                size="lg"
                expression={mascotExpression}
                className="lg:mx-0"
              />
            </div>

            {/* Subtle Feature Highlight Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2.5 py-1">
                🧠 Socratic AI Guidance
              </span>
              <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2.5 py-1">
                ⚡ Real-Time Conceptual Feedback
              </span>
              <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/40 px-2.5 py-1">
                📈 Adaptive SOLO Mastery
              </span>
            </div>
          </div>

          {/* Right Column: Mobile Mascot + LoginForm Card */}
          <div className="flex flex-col items-center justify-center lg:col-span-6">
            {/* Mobile Mascot Header (visible only on screens < lg) */}
            <div className="mb-2 w-full flex flex-col items-center text-center lg:hidden">
              <AuthMascot
                size="sm"
                expression={mascotExpression}
                className="mb-1"
              />
            </div>

            {/* Glassmorphic Login Form Card */}
            <LoginForm onExpressionChange={setMascotExpression} />
          </div>
        </div>
      </main>

      {/* Footer Minimalist Copyright */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} ATLAS. Formative Assessment Platform.
      </footer>
    </div>
  );
}
