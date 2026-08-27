"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, LayoutDashboard, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
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

const navigation = [
  {
    label: "Capabilities",
    href: "#capabilities",
  },
  {
    label: "Progression",
    href: "#progression",
  },
  {
    label: "Guides & FAQ",
    href: "#guides-faq",
  },
  {
    label: "Project",
    href: "#project",
  },
] as const;

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle visual theme"
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
        Dashboard
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
        Sign In
      </Button>

      <Button
        size="sm"
        className={isMobile ? "w-full" : ""}
        nativeButton={false}
        render={<Link href="/register" />}
      >
        Get Started
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo with Real Logo Image */}
        <Link
          href="/"
          aria-label="ATLAS Home"
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
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
                  aria-label="Open navigation menu"
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
                      Atlas, Targeted Learning Assessment System
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
                      onClick={() => setMobileOpen(false)}
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
