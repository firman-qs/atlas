import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.hoisted(() => vi.fn());
const useAuth = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth,
}));

vi.mock("@/features/auth/components/register-form", () => ({
  RegisterForm: () => <div>Register form</div>,
}));

import RegisterPage from "./page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders the student registration form", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Register form")).toBeInTheDocument();
  });

  it("redirects an authenticated user away from registration", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<RegisterPage />);

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
