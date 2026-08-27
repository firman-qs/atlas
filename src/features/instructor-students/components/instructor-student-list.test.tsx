import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorStudentList } from "@/features/instructor-students/components/instructor-student-list";

const mockedUseInstructorStudents = vi.hoisted(() => vi.fn());

vi.mock("@/features/instructor-students/queries", () => ({
  useInstructorStudents: mockedUseInstructorStudents,
}));

const students = {
  items: [
    {
      id: "student-1",
      email: "student@atlas.com",
      full_name: "Balanar Jr",
    },
    {
      id: "student-2",
      email: "student_test1@atlas.edu",
      full_name: "Test Student",
    },
  ],
  page: 1,
  page_size: 20,
  total: 2,
};

describe("InstructorStudentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseInstructorStudents.mockReturnValue({
      data: students,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("renders students returned by the instructor student endpoint", () => {
    render(<InstructorStudentList />);

    expect(screen.getByText("Balanar Jr")).toBeInTheDocument();
    expect(screen.getByText("student@atlas.com")).toBeInTheDocument();

    expect(screen.getByText("Test Student")).toBeInTheDocument();
    expect(screen.getByText("student_test1@atlas.edu")).toBeInTheDocument();

    expect(screen.getByText("2 students")).toBeInTheDocument();
  });

  it("submits a trimmed student search", async () => {
    render(<InstructorStudentList />);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /search students/i,
      }),
      {
        target: {
          value: "  student  ",
        },
      },
    );

    fireEvent.submit(
      screen
        .getByRole("textbox", {
          name: /search students/i,
        })
        .closest("form")!,
    );

    await waitFor(() => {
      expect(mockedUseInstructorStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "student",
          page: 1,
        }),
      );
    });
  });

  it("renders an empty state", () => {
    mockedUseInstructorStudents.mockReturnValue({
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

    render(<InstructorStudentList />);

    expect(screen.getByText("No students found")).toBeInTheDocument();
  });

  it("renders request errors", () => {
    mockedUseInstructorStudents.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Unable to load students."),
    });

    render(<InstructorStudentList />);

    expect(screen.getByText("Unable to load students.")).toBeInTheDocument();
  });
});
