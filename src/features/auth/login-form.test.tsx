import { render, screen } from "@testing-library/react";
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
});
