import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());

const cancelAssessmentMutateAsync = vi.hoisted(() => vi.fn());
const cancelAssessmentReset = vi.hoisted(() => vi.fn());

const useCreateProgressAssessment = vi.hoisted(() => vi.fn());
const useCreateReviewAssessment = vi.hoisted(() => vi.fn());
const useStartAssessment = vi.hoisted(() => vi.fn());
const useStudentQuestionBanks = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/student-course/queries", () => ({
  useCreateProgressAssessment,
  useCreateReviewAssessment,
  useStartAssessment,
  useStudentQuestionBanks,

  useCancelAssessment: () => ({
    mutateAsync: cancelAssessmentMutateAsync,
    reset: cancelAssessmentReset,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import { AssessmentOptionsPanel } from "@/features/student-course/components/assessment-options";
import type { AssessmentOptions } from "@/features/student-course/types";

describe("AssessmentOptionsPanel", () => {
  const createProgressMutate = vi.fn();
  const createReviewMutate = vi.fn();
  const startMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useCreateProgressAssessment.mockReturnValue({
      mutate: createProgressMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    useCreateReviewAssessment.mockReturnValue({
      mutate: createReviewMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    useStartAssessment.mockReturnValue({
      mutate: startMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    useStudentQuestionBanks.mockReturnValue({
      data: {
        items: [],
        page: 1,
        page_size: 100,
        total: 0,
        total_pages: 0,
      },
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("starts an already-created active assessment and navigates after success", () => {
    const options: AssessmentOptions = {
      learning_record_id: "lr-1",

      active_assessment: {
        id: "assessment-1",
        learning_objective_id: "lo-1",
        mode: "progress",
        status: "created",
      },

      progress: null,
      review: [],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    expect(screen.getByText("Active assessment")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("created")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel assessment/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /start assessment/i,
      }),
    );

    expect(startMutate).toHaveBeenCalledTimes(1);

    expect(startMutate).toHaveBeenCalledWith(
      "assessment-1",
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    const [, optionsArg] = startMutate.mock.calls[0] as [
      string,
      {
        onSuccess: () => void;
      },
    ];

    optionsArg.onSuccess();

    expect(push).toHaveBeenCalledWith("/student/assessments/assessment-1");
  });

  it("links back to the runner when an assessment is already running", () => {
    const options: AssessmentOptions = {
      learning_record_id: "lr-1",

      active_assessment: {
        id: "assessment-running",
        learning_objective_id: "lo-1",
        mode: "review",
        status: "running",
      },

      progress: null,
      review: [],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    expect(
      screen.getByRole("button", {
        name: /continue assessment/i,
      }),
    ).toHaveAttribute("href", "/student/assessments/assessment-running");

    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel assessment/i,
      }),
    ).toBeInTheDocument();
  });

  it("creates the next available progress assessment", () => {
    const options: AssessmentOptions = {
      learning_record_id: "lr-1",

      active_assessment: null,

      progress: {
        learning_objective: {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux and Gauss's law.",
          display_order: 1,
        },
      },

      review: [],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    expect(screen.getByText("Progress assessment")).toBeInTheDocument();

    expect(screen.getByText("Learning Objective 1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /start progress assessment/i,
      }),
    );

    expect(createProgressMutate).toHaveBeenCalledWith("lo-1");

    expect(screen.getByText("Review assessments")).toBeInTheDocument();

    expect(screen.getByText("Locked")).toBeInTheDocument();
  });

  it("creates review assessments at learning-objective, concept, and level scope", async () => {
    useStudentQuestionBanks.mockReturnValue({
      data: {
        items: [
          {
            id: "bank-1",
            code: "review-bank",
            name: "Electrostatics Review",
            description: "Published review questions.",
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
        total_pages: 1,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    const options: AssessmentOptions = {
      learning_record_id: "lr-1",

      active_assessment: null,

      progress: null,

      review: [
        {
          learning_objective: {
            id: "lo-1",
            code: "lo1",
            description: "Explain electric flux.",
            display_order: 1,
          },

          can_review_learning_objective: true,

          concepts: [
            {
              learning_objective_concept_id: "loc-1",

              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },

              can_review_concept: true,

              mastered_levels: [
                {
                  loc_level_id: "loc-level-1",
                  solo_level_id: "solo-1",
                  solo_code: "unistructural",
                  solo_level: 1,
                  display_order: 1,
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    expect(screen.getByText("Whole objective available")).toBeInTheDocument();

    expect(screen.getByText("Electric Flux")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /review learning objective/i,
      }),
    );

    expect(createReviewMutate).toHaveBeenCalledWith({
      learningObjectiveId: "lo-1",

      reviewTarget: {
        scope: "learning_objective",
      },

      questionBankId: null,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /review concept/i,
      }),
    );

    expect(createReviewMutate).toHaveBeenCalledWith({
      learningObjectiveId: "lo-1",

      reviewTarget: {
        scope: "concept",
        learning_objective_concept_id: "loc-1",
      },

      questionBankId: null,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /unistructural/i,
      }),
    );

    expect(createReviewMutate).toHaveBeenCalledWith({
      learningObjectiveId: "lo-1",

      reviewTarget: {
        scope: "level",
        learning_objective_concept_id: "loc-1",
        loc_level_id: "loc-level-1",
      },

      questionBankId: null,
    });

    expect(createReviewMutate).toHaveBeenCalledTimes(3);

    await waitFor(() => {
      expect(useStudentQuestionBanks).toHaveBeenCalledWith("lr-1");
    });
  });

  it("presents the next progress assessment as the primary assessment action", () => {
    const options: AssessmentOptions = {
      learning_record_id: "lr-1",
      active_assessment: null,

      progress: {
        learning_objective: {
          id: "lo-2",
          code: "lo2",
          description:
            "Apply electrostatic potential to electromagnetic problems.",
          display_order: 2,
        },
      },

      review: [],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    const progressSection = screen.getByTestId("progress-assessment");

    expect(progressSection).toHaveTextContent("Progress assessment");
    expect(progressSection).toHaveTextContent("Learning Objective 2");
    expect(progressSection).toHaveTextContent(
      "Apply electrostatic potential to electromagnetic problems.",
    );

    expect(
      screen.getByRole("button", {
        name: /start progress assessment/i,
      }),
    ).toBeInTheDocument();
  });

  it("groups mastered review targets by learning objective and concept", () => {
    const options: AssessmentOptions = {
      learning_record_id: "lr-1",
      active_assessment: null,
      progress: null,

      review: [
        {
          learning_objective: {
            id: "lo-1",
            code: "lo1",
            description: "Explain electric flux.",
            display_order: 1,
          },

          can_review_learning_objective: true,

          concepts: [
            {
              learning_objective_concept_id: "loc-1",

              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },

              can_review_concept: true,

              mastered_levels: [
                {
                  loc_level_id: "loc-level-1",
                  solo_level_id: "solo-1",
                  solo_code: "unistructural",
                  solo_level: 1,
                  display_order: 1,
                },
                {
                  loc_level_id: "loc-level-2",
                  solo_level_id: "solo-2",
                  solo_code: "multistructural",
                  solo_level: 2,
                  display_order: 2,
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <AssessmentOptionsPanel options={options} learningRecordId="lr-1" />,
    );

    const reviewSection = screen.getByTestId("review-assessments");

    expect(reviewSection).toHaveTextContent("Learning Objective 1");
    expect(reviewSection).toHaveTextContent("Electric Flux");
    expect(reviewSection).toHaveTextContent("Unistructural");
    expect(reviewSection).toHaveTextContent("Multistructural");

    expect(
      screen.getByRole("button", {
        name: /review learning objective/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /review concept/i,
      }),
    ).toBeInTheDocument();
  });
});
