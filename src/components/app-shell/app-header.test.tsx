import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockedUseAuth,
  mockedUseActiveRole,
  mockedUseLogout,
  mockedPush,
  mockedReplace,
} = vi.hoisted(() => ({
  mockedUseAuth: vi.fn(),
  mockedUseActiveRole: vi.fn(),
  mockedUseLogout: vi.fn(),
  mockedPush: vi.fn(),
  mockedReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockedPush,
    replace: mockedReplace,
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: mockedUseAuth,
}));

vi.mock("@/features/auth/active-role-provider", () => ({
  useActiveRole: mockedUseActiveRole,
}));

vi.mock("@/features/auth/queries", () => ({
  useLogout: mockedUseLogout,
}));

import { AppHeader } from "@/components/app-shell/app-header";

describe("AppHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "firman@atlas.edu",
        full_name: "Firman Sabil",
        updated_at: "2026-08-23T09:00:00+07:00",
      },
    });

    mockedUseActiveRole.mockReturnValue({
      activeRole: "admin",
      availableRoles: ["admin", "instructor", "student"],
      setActiveRole: vi.fn(),
    });

    mockedUseLogout.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it("opens the authenticated user's account page from the account menu", () => {
    render(<AppHeader />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /firman sabil/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: /my account/i,
      }),
    );

    expect(mockedPush).toHaveBeenCalledWith("/account");
  });
});
