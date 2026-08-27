"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, LayoutDashboard, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/auth-provider";

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

function AuthActions({ isMobile = false }: { isMobile?: boolean }) {
  const tHeader = useTranslations("landing.header");
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />;
  }

  if (isAuthenticated) {
    return (
      <Button
        size="sm"
        className="gap-1.5"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <LayoutDashboard className="size-3.5" />
        {tHeader("dashboard")}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${isMobile ? "flex-col w-full" : ""}`}>
      <Button
        variant="ghost"
        size="sm"
        className={isMobile ? "w-full justify-start" : ""}
        nativeButton={false}
        render={<Link href="/login" />}
      >
        {tHeader("signIn")}
      </Button>

      <Button
        size="sm"
        className={isMobile ? "w-full" : ""}
        nativeButton={false}
        render={<Link href="/register" />}
      >
        {tHeader("getStarted")}
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}

export function LandingHeader() {
  const tNav = useTranslations("landing.nav");
  const tHeader = useTranslations("landing.header");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    {
      label: tNav("features"),
      href: "#features",
    },
    {
      label: tNav("guidesFaq"),
      href: "#guides-faq",
    },
    {
      label: tNav("team"),
      href: "#team",
    },
    {
      label: tNav("publication"),
      href: "#publication",
    },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isMobile = false,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (isMobile) {
        setMobileOpen(false);
      }
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo & Left-Aligned Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label={tHeader("homeAria")}
            className="flex items-center gap-2.5 outline-hidden group"
          >
            <div className="relative size-7 overflow-hidden transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="ATLAS Logo"
                width={28}
                height={28}
                priority
                className="size-full object-contain"
              />
            </div>

            <span className="font-semibold tracking-tight text-foreground text-sm">
              ATLAS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <AuthActions />
        </div>

        {/* Mobile menu and toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher compact />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tHeader("openMenuAria")}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[min(20rem,calc(100vw-2rem))]"
            >
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-7.5 overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="ATLAS Logo"
                      width={30}
                      height={30}
                      className="size-full object-contain"
                    />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-semibold">ATLAS</SheetTitle>
                    <SheetDescription className="text-xs">
                      {tHeader("tagline")}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 flex flex-1 flex-col justify-between">
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-1"
                >
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href, true)}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 border-t pt-6">
                  <AuthActions isMobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
