import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutationState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
}));

vi.mock("@/features/auth/queries", () => ({
  useChangePassword: () => mutationState,
}));

import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mutationState.isPending = false;
    mutationState.isError = false;
    mutationState.error = null;
  });

  it("changes the authenticated user's password", async () => {
    mutationState.mutateAsync.mockResolvedValue("Password has been updated");

    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: {
        value: "current-password",
      },
    });

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
        name: /change password/i,
      }),
    );

    await waitFor(() => {
      expect(mutationState.mutateAsync).toHaveBeenCalledWith({
        current_password: "current-password",
        new_password: "new-password-123",
      });
    });

    expect(screen.getByText("Password has been updated")).toBeInTheDocument();
  });

  it("does not submit when password confirmation differs", async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: {
        value: "current-password",
      },
    });

    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: {
        value: "new-password-123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: {
        value: "something-else",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();

    expect(mutationState.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders a backend password error", () => {
    mutationState.isError = true;
    mutationState.error = new Error("Current password is incorrect.");

    render(<ChangePasswordForm />);

    expect(
      screen.getByText("Current password is incorrect."),
    ).toBeInTheDocument();
  });
});
