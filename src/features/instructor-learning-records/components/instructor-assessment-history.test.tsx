import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorAssessmentHistory } from "@/features/instructor-learning-records/components/instructor-assessment-history";

const mockedUseInstructorLearningRecordAssessments = vi.hoisted(() => vi.fn());

vi.mock("@/features/instructor-learning-records/queries", () => ({
  useInstructorLearningRecordAssessments:
    mockedUseInstructorLearningRecordAssessments,
}));

describe("InstructorAssessmentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders assessment history for the learning record", () => {
    mockedUseInstructorLearningRecordAssessments.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [
          {
            id: "assessment-1",
            learning_record_id: "learning-record-1",
            learning_objective: {
              id: "lo-1",
              course_id: "course-1",
              code: "lo1",
              description: "Explain electromagnetic concepts.",
              display_order: 1,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "progress",
            status: "completed",
            current_loc_level_id: null,
            current_question_id: null,
            current_cycle_number: null,
            started_at: "2026-08-21T08:00:00+07:00",
            completed_at: "2026-08-21T09:00:00+07:00",
          },
          {
            id: "assessment-2",
            learning_record_id: "learning-record-1",
            learning_objective: {
              id: "lo-2",
              course_id: "course-1",
              code: "lo2",
              description: "Apply electromagnetic principles.",
              display_order: 2,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "review",
            status: "running",
            current_loc_level_id: "loc-level-2",
            current_question_id: null,
            current_cycle_number: 1,
            started_at: "2026-08-22T08:00:00+07:00",
            completed_at: null,
          },
        ],
        page: 1,
        page_size: 100,
        total: 2,
      },
    });

    render(
      <InstructorAssessmentHistory
        courseOfferingId="offering-1"
        learningRecordId="learning-record-1"
      />,
    );

    expect(mockedUseInstructorLearningRecordAssessments).toHaveBeenCalledWith(
      "offering-1",
      "learning-record-1",
      {
        page: 1,
        pageSize: 100,
      },
    );

    expect(screen.getByText("Assessment History")).toBeInTheDocument();
    expect(screen.getByText("2 assessments")).toBeInTheDocument();

    expect(screen.getByText("LO1")).toBeInTheDocument();
    expect(screen.getByText("LO2")).toBeInTheDocument();

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();

    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /view evidence for lo1/i,
      }),
    ).toHaveAttribute(
      "href",
      "/instructor/course-offerings/offering-1/learning-records/learning-record-1/assessments/assessment-1",
    );

    expect(
      screen.queryByRole("button", {
        name: /view evidence for lo2/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty assessment state", () => {
    mockedUseInstructorLearningRecordAssessments.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [],
        page: 1,
        page_size: 100,
        total: 0,
      },
    });

    render(
      <InstructorAssessmentHistory
        courseOfferingId="offering-1"
        learningRecordId="learning-record-1"
      />,
    );

    expect(screen.getByText("No assessments yet")).toBeInTheDocument();
  });

  it("renders an assessment API error", () => {
    mockedUseInstructorLearningRecordAssessments.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Unable to load assessment history."),
    });

    render(
      <InstructorAssessmentHistory
        courseOfferingId="offering-1"
        learningRecordId="learning-record-1"
      />,
    );

    expect(
      screen.getByText("Unable to load assessment history."),
    ).toBeInTheDocument();
  });
});
