import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const invalidateQueries = vi.hoisted(() => vi.fn());
const refetchQueries = vi.hoisted(() => vi.fn());
const removeQueries = vi.hoisted(() => vi.fn());

const getQueryData = vi.hoisted(() => vi.fn());

const useAssessment = vi.hoisted(() => vi.fn());
const useIssueNextQuestion = vi.hoisted(() => vi.fn());
const useSubmitAttempt = vi.hoisted(() => vi.fn());

const issueMutate = vi.hoisted(() => vi.fn());
const submitMutate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    getQueryData,
    invalidateQueries,
    refetchQueries,
    removeQueries,
  }),
}));

vi.mock("@/features/student-course/queries", () => ({
  studentAssessmentKeys: {
    detail: (assessmentId: string) => [
      "student-assessment",
      "detail",
      assessmentId,
    ],
    question: (assessmentId: string) => [
      "student-assessment",
      "question",
      assessmentId,
    ],
  },

  useAssessment,

  useIssueNextQuestion,

  useSubmitAttempt,
}));

vi.mock(
  "@/features/student-course/components/cancel-assessment-button",
  () => ({
    CancelAssessmentButton: ({
      assessmentId,
      learningRecordId,
      onCanceled,
    }: {
      assessmentId: string;
      learningRecordId: string;
      onCanceled?: () => void;
    }) => (
      <button
        type="button"
        data-testid="cancel-assessment"
        data-assessment-id={assessmentId}
        data-learning-record-id={learningRecordId}
        onClick={onCanceled}
      >
        Cancel assessment
      </button>
    ),
  }),
);

import { AssessmentRunner } from "@/features/student-course/components/assessment-runner";
import { ApiError } from "@/lib/api/api-error";

const runningAssessment = {
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

  mode: "progress" as const,
  status: "running" as const,

  current_loc_level_id: "level-1",
  current_question_id: "question-1",
  current_cycle_number: 1,

  started_at: "2026-08-23T00:00:00Z",
  completed_at: null,
};

describe("AssessmentRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    invalidateQueries.mockResolvedValue(undefined);
    refetchQueries.mockResolvedValue(undefined);

    useAssessment.mockReturnValue({
      data: runningAssessment,
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    useIssueNextQuestion.mockReturnValue({
      mutate: issueMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    useSubmitAttempt.mockReturnValue({
      mutate: submitMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("renders the current assessment question and cancellation control", () => {
    getQueryData.mockReturnValue({
      id: "question-1",
      prompt: "What is electric flux?",
      content: {
        type: "mcq",
        options: [
          {
            id: "option-1",
            option_text: "Surface integral of E dot da",
          },
          {
            id: "option-2",
            option_text: "Line integral of E dot dl",
          },
        ],
      },
    });

    render(<AssessmentRunner assessmentId="assessment-1" />);

    expect(screen.getByText("What is electric flux?")).toBeInTheDocument();

    expect(screen.getByText("Cycle 1")).toBeInTheDocument();

    expect(screen.getByTestId("cancel-assessment")).toHaveAttribute(
      "data-learning-record-id",
      "lr-1",
    );
  });

  it("issues the authoritative current question when no question is cached", () => {
    getQueryData.mockReturnValue(undefined);

    render(<AssessmentRunner assessmentId="assessment-1" />);

    expect(issueMutate).toHaveBeenCalledTimes(1);
  });

  it("allows retrying a failed question request", () => {
    getQueryData.mockReturnValue(undefined);

    useIssueNextQuestion.mockReturnValue({
      mutate: issueMutate,
      isPending: false,
      isError: true,
      error: new Error("Unable to load question."),
    });

    render(<AssessmentRunner assessmentId="assessment-1" />);

    issueMutate.mockClear();

    fireEvent.click(
      screen.getByRole("button", {
        name: /retry question/i,
      }),
    );

    expect(issueMutate).toHaveBeenCalledTimes(1);
  });

  it("keeps essay text available when evaluation fails", () => {
    getQueryData.mockReturnValue({
      id: "question-essay",
      prompt: "Explain why electric flux is independent of radius.",
      content: {
        type: "essay",
      },
    });

    useSubmitAttempt.mockReturnValue({
      mutate: submitMutate,
      isPending: false,
      isError: true,
      error: new Error("Essay evaluation is temporarily unavailable."),
    });

    render(<AssessmentRunner assessmentId="assessment-1" />);

    const textarea = screen.getByPlaceholderText(/write your answer here/i);

    fireEvent.change(textarea, {
      target: {
        value: "Because the spherical area and field magnitude compensate.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /submit answer/i,
      }),
    );

    expect(submitMutate).toHaveBeenCalledWith(
      {
        answer: {
          text: "Because the spherical area and field magnitude compensate.",
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );

    expect(textarea).toHaveValue(
      "Because the spherical area and field magnitude compensate.",
    );
  });

  it("preserves feedback until the student requests the next question", async () => {
    getQueryData.mockReturnValue({
      id: "question-1",
      prompt: "What is electric flux?",
      content: {
        type: "mcq",
        options: [
          {
            id: "option-1",
            option_text: "Surface integral",
          },
        ],
      },
    });

    submitMutate.mockImplementation(
      (
        _request: unknown,
        options: {
          onSuccess: (result: unknown) => void;
        },
      ) => {
        options.onSuccess({
          attempt_id: "attempt-1",
          question_id: "question-1",
          cycle_number: 1,
          is_correct: true,
          score: 1,
          feedback: "Correct. Electric flux is a surface integral.",
          evaluated_at: "2026-08-23T00:00:00Z",
          cycle_completed: false,
          cycle_score: null,
          mastery_threshold: 0.8,
          level_mastered: false,
          assessment_status: "running",
          current_loc_level_id: "level-1",
        });
      },
    );

    render(<AssessmentRunner assessmentId="assessment-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /surface integral/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /submit answer/i,
      }),
    );

    expect(
      await screen.findByText("Correct. Electric flux is a surface integral."),
    ).toBeInTheDocument();

    expect(issueMutate).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: /next question/i,
      }),
    );

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ["student-assessment", "question", "assessment-1"],
      exact: true,
    });

    expect(issueMutate).toHaveBeenCalledTimes(1);
  });

  it("reconciles authoritative assessment state after a stale submission conflict", async () => {
    getQueryData.mockReturnValue({
      id: "question-1",
      prompt: "What is electric flux?",
      content: {
        type: "mcq",
        options: [
          {
            id: "option-1",
            option_text: "Surface integral",
          },
        ],
      },
    });

    render(<AssessmentRunner assessmentId="assessment-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /surface integral/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /submit answer/i,
      }),
    );

    const [, options] = submitMutate.mock.calls[0] as [
      unknown,
      {
        onError: (error: unknown) => void;
      },
    ];

    await act(async () => {
      options.onError(
        new ApiError(
          409,
          "Assessment state changed while the answer was being evaluated.",
        ),
      );
    });

    await waitFor(() => {
      expect(removeQueries).toHaveBeenCalledWith({
        queryKey: ["student-assessment", "question", "assessment-1"],
        exact: true,
      });

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["student-assessment", "detail", "assessment-1"],
        exact: true,
      });

      expect(refetchQueries).toHaveBeenCalledWith({
        queryKey: ["student-assessment", "detail", "assessment-1"],
        exact: true,
      });
    });
  });

  it("clears cached question state when the assessment becomes canceled", () => {
    getQueryData.mockReturnValue({
      id: "question-1",
      prompt: "Old question",
      content: {
        type: "essay",
      },
    });

    useAssessment.mockReturnValue({
      data: {
        ...runningAssessment,
        status: "canceled",
        current_question_id: null,
        current_cycle_number: null,
        current_loc_level_id: null,
        completed_at: "2026-08-23T01:00:00Z",
      },
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<AssessmentRunner assessmentId="assessment-1" />);

    expect(screen.getByText("Assessment canceled")).toBeInTheDocument();

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ["student-assessment", "question", "assessment-1"],
      exact: true,
    });

    expect(screen.queryByText("Old question")).not.toBeInTheDocument();
  });
});
