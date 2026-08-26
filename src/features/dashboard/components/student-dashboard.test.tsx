import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StudentDashboard } from "@/features/dashboard/components/student-dashboard";

const useStudentCourses = vi.hoisted(() => vi.fn());
const useLearningRecordProgress = vi.hoisted(() => vi.fn());

vi.mock("@/features/student-courses/queries", () => ({
  useStudentCourses,
}));

vi.mock("@/features/student-course/queries", () => ({
  useLearningRecordProgress,
}));

const activeEnrollment = {
  id: "enrollment-active",
  enrolled_at: "2026-08-20T00:00:00Z",

  course_offering: {
    id: "offering-active",
    section: "A",

    course: {
      id: "course-active",
      code: "UM032EM000",
      title: "Electromagnetics",
      credits: 3,
    },

    instructor: {
      id: "instructor-1",
      full_name: "Electromagnetics Instructor",
      email: "instructor@example.com",
    },

    academic_term: {
      id: "term-1",
      year: 2026,
      semester: "odd",
      starts_at: "2026-08-01T00:00:00Z",
      ends_at: "2026-12-31T00:00:00Z",
    },
  },

  learning_record: {
    id: "learning-record-active",
    started_at: "2026-08-21T00:00:00Z",
    completed_at: null,

    active_assessment: {
      id: "assessment-1",
      learning_objective_id: "lo-1",
      mode: "progress",
      status: "running",
    },
  },
};

const startedEnrollment = {
  ...activeEnrollment,
  id: "enrollment-started",

  course_offering: {
    ...activeEnrollment.course_offering,
    id: "offering-started",

    course: {
      ...activeEnrollment.course_offering.course,
      id: "course-started",
      code: "PHY102",
      title: "Modern Physics",
    },
  },

  learning_record: {
    id: "learning-record-started",
    started_at: "2026-08-22T00:00:00Z",
    completed_at: null,
    active_assessment: null,
  },
};

const notStartedEnrollment = {
  ...activeEnrollment,
  id: "enrollment-not-started",

  course_offering: {
    ...activeEnrollment.course_offering,
    id: "offering-not-started",

    course: {
      ...activeEnrollment.course_offering.course,
      id: "course-not-started",
      code: "PHY103",
      title: "Classical Mechanics",
    },
  },

  learning_record: null,
};

describe("StudentDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useStudentCourses.mockReturnValue({
      data: {
        items: [startedEnrollment, notStartedEnrollment, activeEnrollment],
        page: 1,
        page_size: 100,
        total: 3,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useLearningRecordProgress.mockReturnValue({
      data: {
        learning_record_id: "learning-record-active",
        completed_at: null,

        learning_objectives: [
          {
            id: "lo-1",
            code: "lo1",
            description: "Explain electric fields and flux.",
            display_order: 1,
            mastered_at: "2026-08-22T00:00:00Z",

            concepts: [
              {
                learning_objective_concept_id: "loc-1",
                is_required: true,
                display_order: 1,
                mastered_loc_level_id: "loc-level-2",
                mastered_at: "2026-08-22T00:00:00Z",

                concept: {
                  id: "concept-1",
                  code: "em-c001",
                  name: "Electric Field & Flux",
                  description: "Electric fields and flux.",
                },

                levels: [],
              },
              {
                learning_objective_concept_id: "loc-2",
                is_required: true,
                display_order: 2,
                mastered_loc_level_id: "loc-level-2",
                mastered_at: "2026-08-22T00:00:00Z",

                concept: {
                  id: "concept-2",
                  code: "em-c002",
                  name: "Gauss's Law",
                  description: "Gauss's law.",
                },

                levels: [],
              },
            ],
          },
          {
            id: "lo-2",
            code: "lo2",
            description: "Explain electric potential.",
            display_order: 2,
            mastered_at: null,

            concepts: [
              {
                learning_objective_concept_id: "loc-3",
                is_required: true,
                display_order: 1,
                mastered_loc_level_id: null,
                mastered_at: null,

                concept: {
                  id: "concept-3",
                  code: "em-c003",
                  name: "Electric Potential",
                  description: "Electric potential.",
                },

                levels: [],
              },
            ],
          },
        ],
      },

      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("summarizes student learning and prioritizes an active assessment", () => {
    render(<StudentDashboard />);

    const enrolledCourses = screen.getByText("Enrolled Courses");
    const coursesStarted = screen.getByText("Courses Started");
    const activeAssessments = screen.getByText("Active Assessments");

    const summaryCard = enrolledCourses.closest('[data-slot="card"]');

    expect(summaryCard).not.toBeNull();

    expect(coursesStarted.closest('[data-slot="card"]')).toBe(summaryCard);

    expect(activeAssessments.closest('[data-slot="card"]')).toBe(summaryCard);

    expect(
      within(summaryCard as HTMLElement).getByText("3"),
    ).toBeInTheDocument();

    expect(
      within(summaryCard as HTMLElement).getByText("2"),
    ).toBeInTheDocument();

    expect(
      within(summaryCard as HTMLElement).getByText("1"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Continue Learning",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Electromagnetics",
      }),
    ).toBeInTheDocument();

    const continueLearningHeading = screen.getByRole("heading", {
      name: "Continue Learning",
    });

    const continueLearningSection = continueLearningHeading.closest("section");

    expect(continueLearningSection).not.toBeNull();

    expect(
      within(continueLearningSection as HTMLElement).getByRole("link", {
        name: /continue assessment/i,
      }),
    ).toHaveAttribute("href", "/student/assessments/assessment-1");

    expect(
      within(continueLearningSection as HTMLElement).getByText(
        /Section A · Odd 2026 · 3 credits · Electromagnetics Instructor/,
      ),
    ).toBeInTheDocument();

    expect(
      within(continueLearningSection as HTMLElement).getByText(
        "Learning Objectives",
      ),
    ).toBeInTheDocument();

    expect(
      within(continueLearningSection as HTMLElement).getByText(
        "1 of 2 mastered",
      ),
    ).toBeInTheDocument();

    expect(
      within(continueLearningSection as HTMLElement).getByText("Concepts"),
    ).toBeInTheDocument();

    expect(
      within(continueLearningSection as HTMLElement).getByText(
        "2 of 3 mastered",
      ),
    ).toBeInTheDocument();

    expect(
      within(continueLearningSection as HTMLElement).getByRole("link", {
        name: /ai tutor/i,
      }),
    ).toHaveAttribute("href", "/student/courses/enrollment-active/chat");

    expect(useLearningRecordProgress).toHaveBeenCalledWith(
      "learning-record-active",
    );
  });

  it("provides quick access to courses and assessment history", () => {
    render(<StudentDashboard />);

    const quickAccessHeading = screen.getByRole("heading", {
      name: "Quick Access",
    });

    const quickAccessSection = quickAccessHeading.closest("section");

    expect(quickAccessSection).not.toBeNull();

    expect(
      within(quickAccessSection as HTMLElement).getByRole("link", {
        name: /my courses/i,
      }),
    ).toHaveAttribute("href", "/student/courses");

    expect(
      within(quickAccessSection as HTMLElement).getByRole("link", {
        name: /assessment history/i,
      }),
    ).toHaveAttribute("href", "/student/assessments");

    expect(
      screen.queryByRole("heading", {
        name: "My Courses",
      }),
    ).not.toBeInTheDocument();
  });

  it("continues an active review assessment after the learning record is completed", () => {
    useStudentCourses.mockReturnValue({
      data: {
        items: [
          {
            ...activeEnrollment,

            learning_record: {
              id: "learning-record-completed",
              started_at: "2026-08-21T00:00:00Z",
              completed_at: "2026-08-23T13:51:56Z",

              active_assessment: {
                id: "assessment-review",
                learning_objective_id: "lo-1",
                mode: "review",
                status: "running",
              },
            },
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

    useLearningRecordProgress.mockReturnValue({
      data: {
        learning_record_id: "learning-record-completed",
        completed_at: "2026-08-23T13:51:56Z",
        learning_objectives: [],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<StudentDashboard />);

    expect(
      screen.queryByText("No active learning yet"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Electromagnetics",
      }),
    ).toBeInTheDocument();

    const continueLearningHeading = screen.getByRole("heading", {
      name: "Continue Learning",
    });

    const continueLearningSection = continueLearningHeading.closest("section");

    expect(continueLearningSection).not.toBeNull();

    expect(
      within(continueLearningSection as HTMLElement).getByRole("link", {
        name: /continue assessment/i,
      }),
    ).toHaveAttribute("href", "/student/assessments/assessment-review");
  });
});
