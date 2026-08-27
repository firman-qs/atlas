import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutateAsync, mockedUseForgotPassword } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  mockedUseForgotPassword: vi.fn(),
}));

vi.mock("@/features/auth/queries", () => ({
  useForgotPassword: mockedUseForgotPassword,
}));

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseForgotPassword.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it("submits a normalized email address and renders the generic success response", async () => {
    mutateAsync.mockResolvedValue(
      "If an eligible account exists for that email, password reset instructions will be sent.",
    );

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "  Student@Atlas.edu  ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send reset instructions/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "student@atlas.edu",
      });
    });

    expect(
      screen.getByText(
        /if an eligible account exists for that email, password reset instructions will be sent/i,
      ),
    ).toBeInTheDocument();
  });

  it("does not submit an invalid email address", async () => {
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "not-an-email",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send reset instructions/i,
      }),
    );

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("renders a backend password-reset error", () => {
    mockedUseForgotPassword.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: true,
      error: new Error("Password reset service is unavailable."),
      reset: vi.fn(),
    });

    render(<ForgotPasswordForm />);

    expect(
      screen.getByText("Password reset service is unavailable."),
    ).toBeInTheDocument();
  });
});
