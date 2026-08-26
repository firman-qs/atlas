"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium text-primary">ATLAS</p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          AI-Driven Adaptive Formative Assessment
        </h1>

        <p className="mt-4 text-muted-foreground">
          Learn concepts progressively with formative assessment,
          curriculum-grounded feedback, and AI-supported learning.
        </p>

        {!isLoading && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {isAuthenticated ? (
              <Button nativeButton={false} render={<Link href="/dashboard" />}>
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button nativeButton={false} render={<Link href="/register" />}>
                  Get Started
                </Button>

                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
