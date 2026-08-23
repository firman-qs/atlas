import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminCourseOfferingDetail } from "@/features/admin-course-offerings/components/admin-course-offering-detail";

const {
  mockedUseAdminCourseOffering,
  mockedUseUpdateAdminCourseOffering,
  mockedUseDeleteAdminCourseOffering,
  mockedUseAdminUsers,
  mockedPush,
} = vi.hoisted(() => ({
  mockedUseAdminCourseOffering: vi.fn(),
  mockedUseUpdateAdminCourseOffering: vi.fn(),
  mockedUseDeleteAdminCourseOffering: vi.fn(),
  mockedUseAdminUsers: vi.fn(),
  mockedPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockedPush,
  }),
}));

vi.mock("@/features/admin-course-offerings/queries", () => ({
  useAdminCourseOffering: mockedUseAdminCourseOffering,
  useUpdateAdminCourseOffering: mockedUseUpdateAdminCourseOffering,
  useDeleteAdminCourseOffering: mockedUseDeleteAdminCourseOffering,
}));

vi.mock("@/features/admin-users/queries", () => ({
  useAdminUsers: mockedUseAdminUsers,
}));

describe("AdminCourseOfferingDetail", () => {
  const updateMutateAsync = vi.fn().mockResolvedValue(undefined);
  const deleteMutateAsync = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAdminCourseOffering.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        id: "offering-1",
        section: "A",
        course: {
          id: "course-1",
          code: "UM032EM000",
          title: "Electromagnetics",
          credits: 4,
        },
        instructor: {
          id: "instructor-1",
          full_name: "Instructor One",
          email: "instructor@atlas.edu",
        },
        academic_term: {
          id: "term-1",
          year: 2026,
          semester: "ganjil",
          starts_at: "2026-08-01",
          ends_at: "2026-12-31",
        },
      },
    });

    mockedUseAdminUsers.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
            id: "instructor-1",
            full_name: "Instructor One",
            email: "instructor@atlas.edu",
            is_active: true,
            deleted_at: null,
            updated_at: "2026-08-22T10:00:00+07:00",
            roles: ["instructor"],
          },
          {
            id: "instructor-2",
            full_name: "Instructor Two",
            email: "instructor2@atlas.edu",
            is_active: true,
            deleted_at: null,
            updated_at: "2026-08-22T10:00:00+07:00",
            roles: ["instructor"],
          },
        ],
        page: 1,
        page_size: 100,
        total: 2,
      },
    });

    mockedUseUpdateAdminCourseOffering.mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });

    mockedUseDeleteAdminCourseOffering.mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it("renders and updates editable course-offering fields", async () => {
    render(<AdminCourseOfferingDetail courseOfferingId="offering-1" />);

    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();
    expect(screen.getAllByText(/Ganjil 2026/i).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Instructor"), {
      target: {
        value: "instructor-2",
      },
    });

    fireEvent.change(screen.getByLabelText("Section"), {
      target: {
        value: "B",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        instructor_id: "instructor-2",
        section: "B",
      });
    });
  });

  it("deletes the course offering after confirmation", async () => {
    render(<AdminCourseOfferingDetail courseOfferingId="offering-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /^delete course offering$/i,
      }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirm delete/i,
      }),
    );

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockedPush).toHaveBeenCalledWith("/admin/course-offerings");
  });
});
