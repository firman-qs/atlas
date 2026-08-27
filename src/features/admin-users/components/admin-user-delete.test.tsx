import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserDelete } from "@/features/admin-users/components/admin-user-delete";

const mockedUseDeleteAdminUser = vi.hoisted(() => vi.fn());
const mockedPush = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin-users/queries", () => ({
  useDeleteAdminUser: mockedUseDeleteAdminUser,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockedPush,
  }),
}));

function createMutationMock() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  };
}

describe("AdminUserDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDeleteAdminUser.mockReturnValue(createMutationMock());
  });

  it("deletes the user after confirmation", async () => {
    const mutation = createMutationMock();

    mockedUseDeleteAdminUser.mockReturnValue(mutation);

    render(<AdminUserDelete userId="user-1" userName="Test User" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /delete user/i,
      }),
    );

    expect(screen.getByText(/delete user\?/i)).toBeInTheDocument();

    const dialog = screen.getByRole("alertdialog");

    expect(
      within(dialog).getByText(
        /this will deactivate the account and mark it as deleted/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirm delete/i,
      }),
    );

    await waitFor(() => {
      expect(mutation.mutateAsync).toHaveBeenCalled();
    });

    expect(mockedPush).toHaveBeenCalledWith("/admin/users");
  });

  it("renders a backend deletion conflict", () => {
    mockedUseDeleteAdminUser.mockReturnValue({
      ...createMutationMock(),
      isError: true,
      error: new Error(
        "User cannot be deleted while academic dependencies exist.",
      ),
    });

    render(<AdminUserDelete userId="user-1" userName="Test User" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /delete user/i,
      }),
    );

    expect(
      screen.getByText(
        /user cannot be deleted while academic dependencies exist/i,
      ),
    ).toBeInTheDocument();
  });
});
