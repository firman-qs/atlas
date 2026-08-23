import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminCourseOfferingManager } from "@/features/admin-course-offerings/components/admin-course-offering-manager";

const {
  mockedUseAdminCourseOfferings,
  mockedUseCreateAdminCourseOffering,
  mockedUseAdminCourses,
  mockedUseAdminUsers,
  mockedUseAdminAcademicTerms,
} = vi.hoisted(() => ({
  mockedUseAdminCourseOfferings: vi.fn(),
  mockedUseCreateAdminCourseOffering: vi.fn(),
  mockedUseAdminCourses: vi.fn(),
  mockedUseAdminUsers: vi.fn(),
  mockedUseAdminAcademicTerms: vi.fn(),
}));

vi.mock("@/features/admin-course-offerings/queries", () => ({
  useAdminCourseOfferings: mockedUseAdminCourseOfferings,
  useCreateAdminCourseOffering: mockedUseCreateAdminCourseOffering,
}));

vi.mock("@/features/admin-courses/queries", () => ({
  useAdminCourses: mockedUseAdminCourses,
}));

vi.mock("@/features/admin-users/queries", () => ({
  useAdminUsers: mockedUseAdminUsers,
}));

vi.mock("@/features/admin-academic-terms/queries", () => ({
  useAdminAcademicTerms: mockedUseAdminAcademicTerms,
}));

describe("AdminCourseOfferingManager", () => {
  const mutateAsync = vi.fn().mockResolvedValue({
    id: "offering-2",
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAdminCourseOfferings.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
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
        ],
        page: 1,
        page_size: 100,
        total: 1,
      },
    });

    mockedUseAdminCourses.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
            id: "course-1",
            code: "UM032EM000",
            title: "Electromagnetics",
            description: "Electromagnetics course",
            credits: 4,
            is_active: true,
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
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
            id: "student-1",
            full_name: "Student One",
            email: "student@atlas.edu",
            is_active: true,
            deleted_at: null,
            updated_at: "2026-08-22T10:00:00+07:00",
            roles: ["student"],
          },
        ],
        page: 1,
        page_size: 100,
        total: 2,
      },
    });

    mockedUseAdminAcademicTerms.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
            id: "term-1",
            year: 2026,
            semester: "ganjil",
            starts_at: "2026-08-01",
            ends_at: "2026-12-31",
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
      },
    });

    mockedUseCreateAdminCourseOffering.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it("renders configured course offerings", () => {
    render(<AdminCourseOfferingManager />);

    expect(screen.getByText("Course Offerings")).toBeInTheDocument();
    expect(screen.getAllByText("UM032EM000").length).toBeGreaterThan(0);
    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();
    expect(screen.getByText("Section A")).toBeInTheDocument();
    expect(screen.getAllByText("Ganjil 2026").length).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", {
        name: /manage/i,
      }),
    ).toHaveAttribute("href", "/admin/course-offerings/offering-1");
  });

  it("creates a course offering using an active instructor", async () => {
    render(<AdminCourseOfferingManager />);

    fireEvent.change(screen.getByLabelText("Course"), {
      target: {
        value: "course-1",
      },
    });

    fireEvent.change(screen.getByLabelText("Academic term"), {
      target: {
        value: "term-1",
      },
    });

    fireEvent.change(screen.getByLabelText("Instructor"), {
      target: {
        value: "instructor-1",
      },
    });

    fireEvent.change(screen.getByLabelText("Section"), {
      target: {
        value: " B ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /create course offering/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        course_id: "course-1",
        instructor_id: "instructor-1",
        academic_term_id: "term-1",
        section: "B",
      });
    });
  });

  it("does not offer non-instructor users for assignment", () => {
    render(<AdminCourseOfferingManager />);

    expect(
      screen.getByRole("option", {
        name: /instructor one/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", {
        name: /student one/i,
      }),
    ).not.toBeInTheDocument();
  });
});
