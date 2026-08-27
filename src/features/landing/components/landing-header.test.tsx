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

    expect(screen.getByRole("link", { name: "Capabilities" })).toHaveAttribute(
      "href",
      "#capabilities",
    );
    expect(screen.getByRole("link", { name: "Progression" })).toHaveAttribute(
      "href",
      "#progression",
    );
    expect(screen.getByRole("link", { name: "Guides & FAQ" })).toHaveAttribute(
      "href",
      "#guides-faq",
    );
    expect(screen.getByRole("link", { name: "Project" })).toHaveAttribute(
      "href",
      "#project",
    );
  });
});
