import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserDetail } from "@/features/admin-users/components/admin-user-detail";

const {
  mockedUseAdminUser,
  mockedUseAssignAdminUserRole,
  mockedUseRemoveAdminUserRole,
} = vi.hoisted(() => ({
  mockedUseAdminUser: vi.fn(),
  mockedUseAssignAdminUserRole: vi.fn(),
  mockedUseRemoveAdminUserRole: vi.fn(),
}));

vi.mock("@/features/admin-users/queries", () => ({
  useAdminUser: mockedUseAdminUser,
  useAssignAdminUserRole: mockedUseAssignAdminUserRole,
  useRemoveAdminUserRole: mockedUseRemoveAdminUserRole,
}));

vi.mock("@/features/admin-users/components/admin-user-delete", () => ({
  AdminUserDelete: ({
    userId,
    userName,
  }: {
    userId: string;
    userName: string;
  }) => (
    <div data-testid="admin-user-delete">
      Delete {userName} ({userId})
    </div>
  ),
}));

function createMutationMock() {
  return {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
    reset: vi.fn(),
  };
}

describe("AdminUserDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAdminUser.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        id: "user-1",
        email: "instructor@atlas.edu",
        full_name: "Instructor One",
        is_active: true,
        deleted_at: null,
        updated_at: "2026-08-22T10:00:00+07:00",
        roles: ["instructor", "admin"],
      },
    });

    mockedUseAssignAdminUserRole.mockReturnValue(createMutationMock());

    mockedUseRemoveAdminUserRole.mockReturnValue(createMutationMock());
  });

  it("renders the user account and assigned roles", () => {
    render(<AdminUserDetail userId="user-1" />);

    expect(mockedUseAdminUser).toHaveBeenCalledWith("user-1");

    expect(screen.getAllByText("Instructor One").length).toBeGreaterThan(0);

    expect(screen.getAllByText("instructor@atlas.edu").length).toBeGreaterThan(
      0,
    );

    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Instructor").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);

    expect(screen.getByText("user-1")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /users/i,
      }),
    ).toHaveAttribute("href", "/admin/users");

    expect(screen.getByText("Role Management")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /assign student role/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /remove instructor role/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /remove admin role/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("admin-user-delete")).toHaveTextContent(
      "Delete Instructor One (user-1)",
    );
  });

  it("renders an API error", () => {
    mockedUseAdminUser.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Unable to load user."),
      data: undefined,
    });

    render(<AdminUserDetail userId="user-1" />);

    expect(screen.getByText("Unable to load user.")).toBeInTheDocument();
  });
});
