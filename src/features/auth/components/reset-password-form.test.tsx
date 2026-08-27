import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateAsync = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/queries", () => ({
  useResetPassword: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets the password using the supplied reset token", async () => {
    mutateAsync.mockResolvedValue("Password successfully reset.");

    render(<ResetPasswordForm token="reset-token-123" />);

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        token: "reset-token-123",
        password: "new-password-123",
      });
    });

    expect(
      screen.getByText(/password successfully reset/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to sign in/i,
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("does not submit when password confirmation differs", async () => {
    render(<ResetPasswordForm token="reset-token-123" />);

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: {
        value: "different-password",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      }),
    );

    expect(
      await screen.findByText(/password confirmation does not match/i),
    ).toBeInTheDocument();

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("renders a backend reset-token error", async () => {
    mutateAsync.mockRejectedValue(
      new Error("Password reset token is invalid, expired, or already used."),
    );

    render(<ResetPasswordForm token="invalid-token" />);

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      }),
    );

    expect(
      await screen.findByText(
        /password reset token is invalid, expired, or already used/i,
      ),
    ).toBeInTheDocument();
  });
});
