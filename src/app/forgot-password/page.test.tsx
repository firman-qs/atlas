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

vi.mock("@/features/auth/components/forgot-password-form", () => ({
  ForgotPasswordForm: () => <div>Forgot password form</div>,
}));

import ForgotPasswordPage from "./page";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders the password recovery form", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Forgot password form")).toBeInTheDocument();
  });

  it("redirects an authenticated user away from password recovery", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<ForgotPasswordPage />);

    expect(replace).toHaveBeenCalledWith("/");
  });
});
