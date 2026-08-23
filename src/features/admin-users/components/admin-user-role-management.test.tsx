import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserRoleManagement } from "@/features/admin-users/components/admin-user-role-management";

const {
  mockedUseAssignAdminUserRole,
  mockedUseRemoveAdminUserRole,
} = vi.hoisted(() => ({
  mockedUseAssignAdminUserRole: vi.fn(),
  mockedUseRemoveAdminUserRole: vi.fn(),
}));

vi.mock("@/features/admin-users/queries", () => ({
  useAssignAdminUserRole: mockedUseAssignAdminUserRole,
  useRemoveAdminUserRole: mockedUseRemoveAdminUserRole,
}));

const user = {
  id: "user-1",
  email: "instructor@atlas.edu",
  full_name: "Instructor One",
  is_active: true,
  deleted_at: null,
  updated_at: "2026-08-22T10:00:00+07:00",
  roles: ["instructor", "admin"] as const,
};

function mutationMock() {
  return {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
    reset: vi.fn(),
  };
}

describe("AdminUserRoleManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAssignAdminUserRole.mockReturnValue(
      mutationMock(),
    );

    mockedUseRemoveAdminUserRole.mockReturnValue(
      mutationMock(),
    );
  });

  it("renders assigned and unassigned roles", () => {
    render(
      <AdminUserRoleManagement
        user={{
          ...user,
          roles: ["instructor", "admin"],
        }}
      />,
    );

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
  });

  it("assigns an unassigned role", () => {
    const assignMutation = mutationMock();

    mockedUseAssignAdminUserRole.mockReturnValue(
      assignMutation,
    );

    render(
      <AdminUserRoleManagement
        user={{
          ...user,
          roles: ["instructor", "admin"],
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /assign student role/i,
      }),
    );

    expect(assignMutation.mutate).toHaveBeenCalledWith(
      "student",
    );
  });

  it("removes an assigned role", () => {
    const removeMutation = mutationMock();

    mockedUseRemoveAdminUserRole.mockReturnValue(
      removeMutation,
    );

    render(
      <AdminUserRoleManagement
        user={{
          ...user,
          roles: ["instructor", "admin"],
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove instructor role/i,
      }),
    );

    expect(removeMutation.mutate).toHaveBeenCalledWith(
      "instructor",
    );
  });

  it("renders a backend conflict message", () => {
    mockedUseRemoveAdminUserRole.mockReturnValue({
      ...mutationMock(),
      isError: true,
      error: new Error(
        "Instructor role cannot be removed while course offerings depend on this user.",
      ),
    });

    render(
      <AdminUserRoleManagement
        user={{
          ...user,
          roles: ["instructor", "admin"],
        }}
      />,
    );

    expect(
      screen.getByText(
        /instructor role cannot be removed while course offerings depend on this user/i,
      ),
    ).toBeInTheDocument();
  });
});
