import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserList } from "@/features/admin-users/components/admin-user-list";

const mockedUseAdminUsers = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin-users/queries", () => ({
  useAdminUsers: mockedUseAdminUsers,
}));

describe("AdminUserList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAdminUsers.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
            id: "user-1",
            email: "student@atlas.com",
            full_name: "Balanar Jr",
            is_active: true,
            deleted_at: null,
            updated_at: "2026-08-22T10:00:00+07:00",
            roles: ["student"],
          },
          {
            id: "user-2",
            email: "lecturer@atlas.com",
            full_name: "Instructor One",
            is_active: true,
            deleted_at: null,
            updated_at: "2026-08-22T10:00:00+07:00",
            roles: ["instructor", "admin"],
          },
        ],
        page: 1,
        page_size: 50,
        total: 2,
      },
    });
  });

  it("renders users and their roles", () => {
    render(<AdminUserList />);

    expect(screen.getByText("Balanar Jr")).toBeInTheDocument();
    expect(
      screen.getByText("student@atlas.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Instructor One"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("lecturer@atlas.com"),
    ).toBeInTheDocument();

    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Instructor")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();

    expect(screen.getAllByText("Active")).toHaveLength(2);

    expect(
      screen.getByRole("button", {
        name: /manage balanar jr/i,
      }),
    ).toHaveAttribute("href", "/admin/users/user-1");

    expect(screen.getByText("Showing 2 of 2 users.")).toBeInTheDocument();
  });

  it("submits a user search", () => {
    render(<AdminUserList />);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /search users/i,
      }),
      {
        target: {
          value: "Balanar",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /search/i,
      }),
    );

    expect(mockedUseAdminUsers).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 50,
      search: "Balanar",
      isActive: undefined,
    });
  });

  it("renders an empty state", () => {
    mockedUseAdminUsers.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [],
        page: 1,
        page_size: 50,
        total: 0,
      },
    });

    render(<AdminUserList />);

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("renders an API error", () => {
    mockedUseAdminUsers.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Unable to load users."),
      data: undefined,
    });

    render(<AdminUserList />);

    expect(
      screen.getByText("Unable to load users."),
    ).toBeInTheDocument();
  });
});
