"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/features/auth/auth-provider";

const exploreLinks = [
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
    label: "Project Team",
    href: "#project",
  },
  {
    label: "Publication",
    href: "#publication",
  },
] as const;

function PlatformLinks() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/dashboard"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Open Dashboard
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Link
        href="/login"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign In
      </Link>

      <Link
        href="/register"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Get Started
      </Link>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-muted/20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand Col with Real Logo Image */}
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="ATLAS Home"
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="relative size-7.5 overflow-hidden transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ATLAS Logo"
                  width={30}
                  height={30}
                  className="size-full object-contain"
                />
              </div>
              <span className="font-semibold tracking-tight text-foreground text-sm">
                ATLAS
              </span>
            </Link>

            <p className="mt-3 text-xs font-medium text-foreground">
              Atlas, Targeted Learning Assessment System
            </p>

            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              An academic educational platform for AI-supported adaptive formative assessment,
              conceptual progression, and evidence-grounded learning.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              Platform
            </h4>

            <div className="mt-3">
              <PlatformLinks />
            </div>
          </div>

          {/* Explore Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              Explore
            </h4>

            <nav
              aria-label="Footer navigation"
              className="mt-3 flex flex-col items-start gap-2"
            >
              {exploreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Project & Support Acknowledgement */}
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              Institutional Support
            </h4>

            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Universitas Negeri Malang</p>
              <p>Internal Non-PNBP Funding</p>
              <p className="text-[11px]">Department of Physics</p>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright Row */}
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ATLAS. All rights reserved.</p>
          <p>Formative assessment for conceptual learning.</p>
        </div>
      </div>
    </footer>
  );
}
