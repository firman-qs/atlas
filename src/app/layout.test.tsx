import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Inter: () => ({ variable: "font-inter" }),
}));

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn().mockResolvedValue("en"),
  getMessages: vi.fn().mockResolvedValue({}),
  getTranslations: vi.fn(),
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/providers/app-provider", () => ({
  AppProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/providers/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("opts smooth scrolling into Next.js route-transition handling", async () => {
    const layout = await RootLayout({ children: <main>ATLAS</main> });

    expect(layout.props).toMatchObject({
      lang: "en",
      "data-scroll-behavior": "smooth",
    });
  });
});
