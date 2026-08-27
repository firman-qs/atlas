import { render, screen } from "@/test/render";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/features/auth/queries", () => ({
  useLogin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import { LoginForm } from "@/features/auth/login-form";

describe("LoginForm", () => {
  it("provides a password-recovery link", () => {
    render(<LoginForm />);

    const link = screen.getByRole("link", {
      name: /forgot password/i,
    });

    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("provides a student registration link", () => {
    render(<LoginForm />);

    const link = screen.getByRole("link", {
      name: /create account/i,
    });

    expect(link).toHaveAttribute("href", "/register");
  });

  it("renders the Indonesian sign-in heading while preserving auth links", () => {
    render(<LoginForm />, { locale: "id" });

    expect(screen.getByText("Masuk ke ATLAS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lupa kata sandi?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
