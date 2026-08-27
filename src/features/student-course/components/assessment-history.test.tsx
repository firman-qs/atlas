import { fireEvent, render, screen, waitFor, within } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());

const useAssessments = vi.hoisted(() => vi.fn());
const useStartAssessment = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/student-course/queries", () => ({
  useAssessments,
  useStartAssessment,
}));

vi.mock(
  "@/features/student-course/components/cancel-assessment-button",
  () => ({
    CancelAssessmentButton: ({
      assessmentId,
      learningRecordId,
    }: {
      assessmentId: string;
      learningRecordId: string;
    }) => (
      <button
        type="button"
        data-testid={`cancel-${assessmentId}`}
        data-learning-record-id={learningRecordId}
      >
        Cancel assessment
      </button>
    ),
  }),
);

import { AssessmentHistory } from "@/features/student-course/components/assessment-history";

describe("AssessmentHistory", () => {
  const startMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useStartAssessment.mockReturnValue({
      mutateAsync: startMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("renders actions for created, running, completed, and canceled assessments", () => {
    useAssessments.mockReturnValue({
      data: {
        items: [
          {
            id: "assessment-created",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-1",
              course_id: "course-1",
              code: "lo1",
              description: "Explain electric flux.",
              display_order: 1,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "progress",
            status: "created",
            current_loc_level_id: null,
            current_question_id: null,
            current_cycle_number: null,
            started_at: null,
            completed_at: null,
          },
          {
            id: "assessment-running",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-2",
              course_id: "course-1",
              code: "lo2",
              description: "Apply Gauss's law.",
              display_order: 2,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "review",
            status: "running",
            current_loc_level_id: "level-1",
            current_question_id: "question-1",
            current_cycle_number: 1,
            started_at: "2026-08-23T01:00:00Z",
            completed_at: null,
          },
          {
            id: "assessment-completed",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-3",
              course_id: "course-1",
              code: "lo3",
              description: "Analyze electric potential.",
              display_order: 3,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "progress",
            status: "completed",
            current_loc_level_id: null,
            current_question_id: null,
            current_cycle_number: null,
            started_at: "2026-08-22T01:00:00Z",
            completed_at: "2026-08-22T02:00:00Z",
          },
          {
            id: "assessment-canceled",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-4",
              course_id: "course-1",
              code: "lo4",
              description: "Interpret electric fields.",
              display_order: 4,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "progress",
            status: "canceled",
            current_loc_level_id: null,
            current_question_id: null,
            current_cycle_number: null,
            started_at: null,
            completed_at: "2026-08-22T03:00:00Z",
          },
        ],
        page: 1,
        page_size: 20,
        total: 4,
        total_pages: 1,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<AssessmentHistory />);

    expect(
      screen.getByRole("heading", {
        name: "Assessments",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Learning Objective 1")).toBeInTheDocument();
    expect(screen.getByText("Learning Objective 2")).toBeInTheDocument();
    expect(screen.getByText("Learning Objective 3")).toBeInTheDocument();
    expect(screen.getByText("Learning Objective 4")).toBeInTheDocument();

    const createdAssessment = screen.getByTestId(
      "assessment-history-assessment-created",
    );

    const runningAssessment = screen.getByTestId(
      "assessment-history-assessment-running",
    );

    const completedAssessment = screen.getByTestId(
      "assessment-history-assessment-completed",
    );

    const canceledAssessment = screen.getByTestId(
      "assessment-history-assessment-canceled",
    );

    expect(createdAssessment).toHaveAttribute("data-assessment-state", "ready");

    expect(runningAssessment).toHaveAttribute(
      "data-assessment-state",
      "active",
    );

    expect(completedAssessment).toHaveAttribute(
      "data-assessment-state",
      "historical",
    );

    expect(canceledAssessment).toHaveAttribute(
      "data-assessment-state",
      "historical",
    );

    expect(
      within(createdAssessment).getByText("Ready to start"),
    ).toBeInTheDocument();

    expect(
      within(runningAssessment).getByText("In progress"),
    ).toBeInTheDocument();

    expect(
      within(completedAssessment).getByText("Completed"),
    ).toBeInTheDocument();

    expect(
      within(canceledAssessment).getByText("Canceled"),
    ).toBeInTheDocument();

    expect(
      within(createdAssessment).getByRole("button", {
        name: /start assessment/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("cancel-assessment-created")).toHaveAttribute(
      "data-learning-record-id",
      "lr-1",
    );

    expect(
      within(runningAssessment).getByRole("button", {
        name: /^continue$/i,
      }),
    ).toHaveAttribute("href", "/student/assessments/assessment-running");

    expect(
      within(completedAssessment).getByRole("button", {
        name: /view result/i,
      }),
    ).toHaveAttribute(
      "href",
      "/student/assessments/assessment-completed/result",
    );

    expect(
      within(canceledAssessment).queryByRole("button"),
    ).not.toBeInTheDocument();

    expect(
      within(completedAssessment).queryByRole("button", {
        name: /start|continue|cancel/i,
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Showing 4 of 4 assessments.")).toBeInTheDocument();
  });

  it("starts a created assessment and navigates to the assessment runner", async () => {
    startMutateAsync.mockResolvedValue({
      id: "assessment-1",
    });

    useAssessments.mockReturnValue({
      data: {
        items: [
          {
            id: "assessment-1",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-1",
              course_id: "course-1",
              code: "lo1",
              description: "Explain electric flux.",
              display_order: 1,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "progress",
            status: "created",
            current_loc_level_id: null,
            current_question_id: null,
            current_cycle_number: null,
            started_at: null,
            completed_at: null,
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
        total_pages: 1,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<AssessmentHistory />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /start assessment/i,
      }),
    );

    await waitFor(() => {
      expect(startMutateAsync).toHaveBeenCalledWith("assessment-1");
    });

    expect(push).toHaveBeenCalledWith("/student/assessments/assessment-1");
  });

  it("localizes assessment history without translating objective content", () => {
    useAssessments.mockReturnValue({
      data: {
        items: [
          {
            id: "assessment-running",
            learning_record_id: "lr-1",
            learning_objective: {
              id: "lo-2",
              course_id: "course-1",
              code: "lo2",
              description: "Apply Gauss's law.",
              display_order: 2,
            },
            question_bank_id: null,
            review_learning_objective_concept_id: null,
            review_loc_level_id: null,
            mode: "review",
            status: "running",
            current_loc_level_id: "level-1",
            current_question_id: "question-1",
            current_cycle_number: 1,
            started_at: "2026-08-23T01:00:00Z",
            completed_at: null,
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
        total_pages: 1,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<AssessmentHistory />, { locale: "id" });

    expect(screen.getByText("Tinjauan")).toBeInTheDocument();
    expect(screen.getByText("Tujuan Pembelajaran 2")).toBeInTheDocument();
    expect(screen.getByText("Apply Gauss's law.")).toBeInTheDocument();
  });
});
