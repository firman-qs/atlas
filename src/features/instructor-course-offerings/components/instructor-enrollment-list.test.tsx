import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorEnrollmentList } from "@/features/instructor-course-offerings/components/instructor-enrollment-list";

const {
  mockedUseInstructorCourseOfferingEnrollments,
  mockedUseDeleteInstructorEnrollment,
} = vi.hoisted(() => ({
  mockedUseInstructorCourseOfferingEnrollments: vi.fn(),
  mockedUseDeleteInstructorEnrollment: vi.fn(),
}));

vi.mock("@/features/instructor-course-offerings/queries", () => ({
  useInstructorCourseOfferingEnrollments:
    mockedUseInstructorCourseOfferingEnrollments,
  useDeleteInstructorEnrollment: mockedUseDeleteInstructorEnrollment,
}));

const enrollments = {
  items: [
    {
      id: "enrollment-1",
      enrolled_at: "2026-08-20T08:00:00+07:00",
      student: {
        id: "student-1",
        full_name: "Balanar Jr",
        email: "student@atlas.com",
      },
      learning_record: null,
    },
    {
      id: "enrollment-2",
      enrolled_at: "2026-08-20T09:00:00+07:00",
      student: {
        id: "student-2",
        full_name: "Terror Blade",
        email: "tb@um.ac.id",
      },
      learning_record: {
        id: "learning-record-1",
        started_at: "2026-08-21T10:00:00+07:00",
        completed_at: null,
      },
    },
  ],
  page: 1,
  page_size: 20,
  total: 2,
};

function createDeleteMutationMock() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
    reset: vi.fn(),
  };
}

describe("InstructorEnrollmentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseInstructorCourseOfferingEnrollments.mockReturnValue({
      data: enrollments,
      isPending: false,
      isError: false,
      error: null,
    });

    mockedUseDeleteInstructorEnrollment.mockReturnValue(
      createDeleteMutationMock(),
    );
  });

  it("renders students enrolled in the instructor's course offering", () => {
    render(<InstructorEnrollmentList courseOfferingId="offering-1" />);

    expect(mockedUseInstructorCourseOfferingEnrollments).toHaveBeenCalledWith(
      "offering-1",
      {
        page: 1,
        pageSize: 100,
      },
    );

    expect(screen.getByText("Enrolled Students")).toBeInTheDocument();

    expect(screen.getByText("Balanar Jr")).toBeInTheDocument();
    expect(screen.getByText("student@atlas.com")).toBeInTheDocument();

    expect(screen.getByText("Terror Blade")).toBeInTheDocument();
    expect(screen.getByText("tb@um.ac.id")).toBeInTheDocument();

    expect(screen.getByText("2 students")).toBeInTheDocument();

    expect(screen.getByText("Not started")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /unenroll balanar jr/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /unenroll terror blade/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state when the offering has no enrollments", () => {
    mockedUseInstructorCourseOfferingEnrollments.mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 20,
        total: 0,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<InstructorEnrollmentList courseOfferingId="offering-1" />);

    expect(screen.getByText("No students enrolled")).toBeInTheDocument();

    expect(
      screen.getByText(
        /students enrolled in this course offering will appear here/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders an API error", () => {
    mockedUseInstructorCourseOfferingEnrollments.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Unable to load enrollments."),
    });

    render(<InstructorEnrollmentList courseOfferingId="offering-1" />);

    expect(screen.getByText("Unable to load enrollments.")).toBeInTheDocument();
  });

  it("unenrolls a student whose learning activity has not started", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockedUseDeleteInstructorEnrollment.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      variables: undefined,
      reset: vi.fn(),
    });

    mockedUseInstructorCourseOfferingEnrollments.mockReturnValue({
      data: {
        items: [
          {
            id: "enrollment-1",
            enrolled_at: "2026-08-22T10:00:00+07:00",
            student: {
              id: "student-1",
              full_name: "Balanar Jr",
              email: "student@atlas.com",
            },
            learning_record: null,
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<InstructorEnrollmentList courseOfferingId="offering-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /unenroll balanar jr/i,
      }),
    );

    expect(screen.getByText(/unenroll student/i)).toBeInTheDocument();

    expect(
      screen.getByText(/remove balanar jr from this course offering/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirm unenroll/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
      expect(mutateAsync).toHaveBeenCalledWith("enrollment-1");
    });
  });
});
