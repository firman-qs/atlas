import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorCourseOfferingList } from "@/features/instructor-course-offerings/components/instructor-course-offering-list";

const mockedUseInstructorCourseOfferings = vi.hoisted(() => vi.fn());

vi.mock("@/features/instructor-course-offerings/queries", () => ({
  useInstructorCourseOfferings: mockedUseInstructorCourseOfferings,
}));

describe("InstructorCourseOfferingList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the authenticated instructor's course offerings", () => {
    mockedUseInstructorCourseOfferings.mockReturnValue({
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
              semester: "odd",
              starts_at: "2026-08-01",
              ends_at: "2026-12-31",
            },
          },
          {
            id: "offering-2",
            section: "B",
            course: {
              id: "course-2",
              code: "PHY101",
              title: "General Physics",
              credits: 3,
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
        ],
        page: 1,
        page_size: 20,
        total: 2,
      },
    });

    render(<InstructorCourseOfferingList />);

    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();
    expect(screen.getByText("UM032EM000")).toBeInTheDocument();
    expect(screen.getAllByText("Section A")).toHaveLength(2);

    expect(screen.getByText("General Physics")).toBeInTheDocument();
    expect(screen.getByText("PHY101")).toBeInTheDocument();
    expect(screen.getAllByText("Section B")).toHaveLength(2);

    expect(screen.getByText("2 offerings")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /open electromagnetics/i,
      }),
    ).toHaveAttribute("href", "/instructor/course-offerings/offering-1");
  });

  it("renders an empty state when the instructor has no offerings", () => {
    mockedUseInstructorCourseOfferings.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [],
        page: 1,
        page_size: 20,
        total: 0,
      },
    });

    render(<InstructorCourseOfferingList />);

    expect(
      screen.getByText("No course offerings assigned"),
    ).toBeInTheDocument();
  });
});
