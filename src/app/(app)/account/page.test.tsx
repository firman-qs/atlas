import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mockedUseAuth = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: mockedUseAuth,
}));

vi.mock("@/features/auth/components/change-password-form", () => ({
  ChangePasswordForm: () => <div>Change Password Form</div>,
}));

import AccountPage from "./page";

describe("AccountPage", () => {
  it("renders the authenticated user's account and security settings", () => {
    mockedUseAuth.mockReturnValue({
      session: {
        user: {
          id: "user-1",
          email: "firman@atlas.edu",
          full_name: "Firman Sabil",
          updated_at: "2026-08-23T09:00:00+07:00",
        },
        roles: ["student", "instructor", "admin"],
      },
      user: {
        id: "user-1",
        email: "firman@atlas.edu",
        full_name: "Firman Sabil",
        updated_at: "2026-08-23T09:00:00+07:00",
      },
      roles: ["student", "instructor", "admin"],
      isAuthenticated: true,
      isLoading: false,
      isAdmin: true,
      isInstructor: true,
      isStudent: true,
    });

    render(<AccountPage />);

    expect(
      screen.getByRole("heading", {
        name: "Account",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Firman Sabil")).toBeInTheDocument();
    expect(screen.getByText("firman@atlas.edu")).toBeInTheDocument();

    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Instructor")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();

    expect(screen.getByText("Change Password Form")).toBeInTheDocument();
  });
});
