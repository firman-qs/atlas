import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorEnrollStudent } from "@/features/instructor-course-offerings/components/instructor-enroll-student";

const { mockedUseInstructorStudents, mockedUseCreateInstructorEnrollment } =
  vi.hoisted(() => ({
    mockedUseInstructorStudents: vi.fn(),
    mockedUseCreateInstructorEnrollment: vi.fn(),
  }));

vi.mock("@/features/instructor-students/queries", () => ({
  useInstructorStudents: mockedUseInstructorStudents,
}));

vi.mock("@/features/instructor-course-offerings/queries", () => ({
  useCreateInstructorEnrollment: mockedUseCreateInstructorEnrollment,
}));

const students = [
  {
    id: "student-1",
    full_name: "Balanar Jr",
    email: "student@atlas.com",
  },
  {
    id: "student-2",
    full_name: "Terror Blade",
    email: "tb@um.ac.id",
  },
];

describe("InstructorEnrollStudent", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mutateAsync.mockResolvedValue({
      id: "enrollment-created-1",
      student_id: "student-1",
      course_offering_id: "offering-1",
      enrolled_at: "2026-08-22T13:00:00+07:00",
    });

    mockedUseInstructorStudents.mockReturnValue({
      data: {
        items: students,
        page: 1,
        page_size: 20,
        total: 2,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    mockedUseCreateInstructorEnrollment.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it("enrolls the selected student into the current course offering", async () => {
    render(<InstructorEnrollStudent courseOfferingId="offering-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /enroll student/i,
      }),
    );

    expect(screen.getByText("Balanar Jr")).toBeInTheDocument();

    expect(screen.getByText("student@atlas.com")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /select balanar jr/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^enroll$/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        student_id: "student-1",
      });
    });
  });
});
