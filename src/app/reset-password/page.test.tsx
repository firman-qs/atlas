import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const searchParamsGet = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: searchParamsGet,
  }),
}));

vi.mock("@/features/auth/components/reset-password-form", () => ({
  ResetPasswordForm: ({ token }: { token: string }) => (
    <div data-testid="reset-password-form">{token}</div>
  ),
}));

import ResetPasswordPage from "./page";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the reset token from the query string to the reset form", () => {
    searchParamsGet.mockImplementation((key: string) =>
      key === "token" ? "reset-token-123" : null,
    );

    render(<ResetPasswordPage />);

    expect(screen.getByTestId("reset-password-form")).toHaveTextContent(
      "reset-token-123",
    );
  });

  it("renders an invalid-link state when the token is missing", () => {
    searchParamsGet.mockReturnValue(null);

    render(<ResetPasswordPage />);

    expect(
      screen.getByText(/password reset link is invalid or incomplete/i),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("reset-password-form")).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /request a new reset link/i,
      }),
    ).toHaveAttribute("href", "/forgot-password");
  });
});
