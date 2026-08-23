import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorCourseOfferingDetail } from "@/features/instructor-course-offerings/components/instructor-course-offering-detail";

const {
  mockedUseInstructorCourseOffering,
  mockedUseInstructorCourseOfferingEnrollments,
  mockedUseDeleteInstructorEnrollment,
} = vi.hoisted(() => ({
  mockedUseInstructorCourseOffering: vi.fn(),
  mockedUseInstructorCourseOfferingEnrollments: vi.fn(),
  mockedUseDeleteInstructorEnrollment: vi.fn(),
}));

vi.mock("@/features/instructor-course-offerings/queries", () => ({
  useInstructorCourseOffering: mockedUseInstructorCourseOffering,
  useInstructorCourseOfferingEnrollments:
    mockedUseInstructorCourseOfferingEnrollments,
  useDeleteInstructorEnrollment: mockedUseDeleteInstructorEnrollment,
}));

vi.mock(
  "@/features/instructor-course-offerings/components/instructor-enroll-student",
  () => ({
    InstructorEnrollStudent: ({
      courseOfferingId,
    }: {
      courseOfferingId: string;
    }) => (
      <div data-testid="instructor-enroll-student">
        Enroll student for {courseOfferingId}
      </div>
    ),
  }),
);

describe("InstructorCourseOfferingDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseInstructorCourseOfferingEnrollments.mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 100,
        total: 0,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    mockedUseDeleteInstructorEnrollment.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
      variables: undefined,
      reset: vi.fn(),
    });
  });

  it("renders an instructor-owned course offering", () => {
    mockedUseInstructorCourseOffering.mockReturnValue({
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
          semester: "odd",
          starts_at: "2026-08-01",
          ends_at: "2026-12-31",
        },
      },
    });

    render(<InstructorCourseOfferingDetail courseOfferingId="offering-1" />);

    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();

    expect(screen.getAllByText("UM032EM000").length).toBeGreaterThan(0);

    expect(screen.getAllByText("Section A").length).toBeGreaterThan(0);

    expect(screen.getAllByText(/2026/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/4 credits/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /course offerings/i,
      }),
    ).toHaveAttribute("href", "/instructor/course-offerings");

    expect(screen.getByText("Enrolled Students")).toBeInTheDocument();

    expect(screen.getByText(/no students enrolled/i)).toBeInTheDocument();

    expect(screen.getByTestId("instructor-enroll-student")).toHaveTextContent(
      "Enroll student for offering-1",
    );
  });
});
