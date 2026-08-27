import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateAsync = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/features/auth/queries", () => ({
  useRegister: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import { RegisterForm } from "@/features/auth/components/register-form";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a student account and sends the user to sign in", async () => {
    mutateAsync.mockResolvedValue({
      id: "user-1",
      email: "student@atlas.edu",
      full_name: "Student One",
      updated_at: "2026-08-23T00:00:00Z",
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: {
        value: "  Student One  ",
      },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "  STUDENT@ATLAS.EDU  ",
      },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: {
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: {
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        full_name: "Student One",
        email: "student@atlas.edu",
        password: "password123",
      });
    });

    expect(
      await screen.findByText(/account created successfully/i),
    ).toBeInTheDocument();

    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("does not register when password confirmation differs", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: {
        value: "Student One",
      },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "student@atlas.edu",
      },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: {
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: {
        value: "different123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    );

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("renders a backend registration error", async () => {
    mutateAsync.mockRejectedValue(new Error("Email is already registered."));

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: {
        value: "Student One",
      },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {
        value: "student@atlas.edu",
      },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: {
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: {
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    );

    expect(
      await screen.findByText(/email is already registered/i),
    ).toBeInTheDocument();
  });
});
