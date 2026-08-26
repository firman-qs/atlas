import { SidebarProvider } from "@/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedUseAuth, mockedUseActiveRole, mockedSetActiveRole, mockedPush } =
  vi.hoisted(() => ({
    mockedUseAuth: vi.fn(),
    mockedUseActiveRole: vi.fn(),
    mockedSetActiveRole: vi.fn(),
    mockedPush: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/courses",
  useRouter: () => ({
    push: mockedPush,
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: mockedUseAuth,
}));

vi.mock("@/features/auth/active-role-provider", () => ({
  useActiveRole: mockedUseActiveRole,
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
      setActiveRole: mockedSetActiveRole,
    });
  });

  it("renders route context and switches workspace role", () => {
    render(
      <SidebarProvider>
        <AppHeader />
      </SidebarProvider>,
    );

    expect(screen.getByText("Courses")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /administrator/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: /student/i,
      }),
    );

    expect(mockedSetActiveRole).toHaveBeenCalledWith("student");
    expect(mockedPush).toHaveBeenCalledWith("/dashboard");
  });
});
