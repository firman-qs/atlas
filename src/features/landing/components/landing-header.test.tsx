import { render, screen } from "@/test/render";
import { describe, expect, it, vi } from "vitest";

const { mockedUseAuth } = vi.hoisted(() => ({
  mockedUseAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: mockedUseAuth,
}));

import { LandingHeader } from "@/features/landing/components/landing-header";

describe("LandingHeader", () => {
  it("keeps public destinations while exposing the language switcher", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LandingHeader />);

    expect(
      screen.getAllByRole("button", { name: "Change language" }),
    ).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("button", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/register",
    );

    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "#features",
    );
    expect(screen.getByRole("link", { name: "Guides & FAQ" })).toHaveAttribute(
      "href",
      "#guides-faq",
    );
    expect(screen.getByRole("link", { name: "Team" })).toHaveAttribute(
      "href",
      "#team",
    );
    expect(screen.getByRole("link", { name: "Publication" })).toHaveAttribute(
      "href",
      "#publication",
    );
  });

  it("renders navigation and actions in Indonesian when locale is id", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LandingHeader />, { locale: "id" });

    expect(
      screen.getAllByRole("button", { name: "Ubah bahasa" }),
    ).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("button", { name: "Mulai Sekarang" })).toHaveAttribute(
      "href",
      "/register",
    );

    expect(screen.getByRole("link", { name: "Fitur" })).toHaveAttribute(
      "href",
      "#features",
    );
    expect(screen.getByRole("link", { name: "Panduan & FAQ" })).toHaveAttribute(
      "href",
      "#guides-faq",
    );
    expect(screen.getByRole("link", { name: "Tim" })).toHaveAttribute(
      "href",
      "#team",
    );
    expect(screen.getByRole("link", { name: "Publikasi" })).toHaveAttribute(
      "href",
      "#publication",
    );
  });
});
