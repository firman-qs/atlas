import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.hoisted(() => vi.fn());
const useAuth = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth,
}));

vi.mock("@/features/auth/queries", () => ({
  useLogin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders the login showcase, mascot, and form", () => {
    render(<LoginPage />);

    expect(screen.getByText("ATLAS")).toBeInTheDocument();
    expect(screen.getByText(/Master concepts with your AI companion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: "input" })).toBeInTheDocument();
  });

  it("redirects an authenticated user away from login", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<LoginPage />);

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
