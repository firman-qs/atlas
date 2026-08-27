import { render, screen, within } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssessmentResultView } from "@/features/student-course/components/assessment-result-view";

const mockedUseAssessmentResult = vi.hoisted(() => vi.fn());

vi.mock("@/features/student-course/queries", () => ({
  useAssessmentResult: mockedUseAssessmentResult,
}));

describe("AssessmentResultView", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAssessmentResult.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        assessment_id: "assessment-1",
        mode: "progress",
        status: "completed",
        question_bank: null,
        review_target: null,
        started_at: "2026-08-23T00:00:00Z",
        completed_at: "2026-08-23T01:00:00Z",
        learning_objective: {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux.",
        },
        total_attempts: 2,
        concepts: [
          {
            learning_objective_concept_id: "loc-1",
            concept_id: "concept-1",
            concept_code: "em-c001",
            concept_name: "Electric Flux",
            display_order: 1,
            levels: [
              {
                loc_level_id: "loc-level-1",
                solo_level_id: "solo-1",
                solo_code: "relational",
                solo_level: 3,
                display_order: 1,
                cycles: [
                  {
                    cycle_number: 1,
                    score: 1,
                    mastery_threshold: 0.8,
                    passed: true,
                    completed_at: "2026-08-23T01:00:00Z",
                    attempts: [
                      {
                        attempt_id: "attempt-mcq",
                        question_id: "question-mcq",
                        question_type: "mcq",
                        question_content: {
                          type: "mcq",
                          options: [
                            {
                              id: "option-1",
                              text: "$\\Phi_E = q / \\epsilon_0$",
                            },
                          ],
                        },
                        prompt:
                          "Choose the **electric flux** expression $\\Phi_E$.",
                        answer: {
                          option_id: "option-1",
                        },
                        is_correct: true,
                        score: 1,
                        feedback:
                          "Correct. **Gauss's law** gives $\\Phi_E = q / \\epsilon_0$.",
                        evaluation_metadata: null,
                        submitted_at: "2026-08-23T00:10:00Z",
                        evaluated_at: "2026-08-23T00:10:01Z",
                      },
                      {
                        attempt_id: "attempt-essay",
                        question_id: "question-essay",
                        question_type: "essay",
                        question_content: {
                          type: "essay",
                        },
                        prompt:
                          "Explain why $\\Phi_E$ is independent of radius.",
                        answer: {
                          text: "Because **$E \\propto 1/r^2$** while area is $4\\pi r^2$.",
                        },
                        is_correct: null,
                        score: 1,
                        feedback: "Good **physical reasoning**.",
                        evaluation_metadata: null,
                        submitted_at: "2026-08-23T00:20:00Z",
                        evaluated_at: "2026-08-23T00:20:01Z",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it("renders Markdown and mathematical notation in persisted assessment evidence", () => {
    const { container } = render(
      <AssessmentResultView assessmentId="assessment-1" />,
    );

    expect(screen.getByText("electric flux")).toHaveProperty(
      "tagName",
      "STRONG",
    );

    expect(screen.getByText("Gauss's law")).toHaveProperty("tagName", "STRONG");

    expect(screen.getByText("physical reasoning")).toHaveProperty(
      "tagName",
      "STRONG",
    );

    expect(container.querySelectorAll(".katex").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: "Learning Objective 1",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
  });

  it("presents persisted attempts using the runner question, answer, and evaluation hierarchy", () => {
    render(<AssessmentResultView assessmentId="assessment-1" />);

    const cycle = screen
      .getByText("Cycle 1")
      .closest('[data-testid="assessment-cycle"]');

    expect(cycle).not.toBeNull();

    const cycleHeading = within(cycle as HTMLElement).getByText("Cycle 1");
    const cycleSummary = cycleHeading.parentElement;

    expect(cycleSummary).not.toBeNull();

    expect(
      within(cycleSummary as HTMLElement).getByText("Score 100%"),
    ).toBeInTheDocument();

    expect(
      within(cycleSummary as HTMLElement).getByText("Mastered"),
    ).toBeInTheDocument();

    const mcqAttempt = screen.getByTestId("assessment-attempt-attempt-mcq");

    expect(within(mcqAttempt).getByText("Question 1")).toBeInTheDocument();

    expect(within(mcqAttempt).getByText("Multiple choice")).toBeInTheDocument();

    expect(
      within(mcqAttempt).getByText("Assessment question"),
    ).toBeInTheDocument();

    expect(within(mcqAttempt).getByText("Your answer")).toBeInTheDocument();

    const mcqEvaluation = within(mcqAttempt).getByTestId("evaluation-section");

    expect(mcqEvaluation).toHaveTextContent("Answer evaluated");
    expect(mcqEvaluation).toHaveTextContent("Correct");
    expect(mcqEvaluation).toHaveTextContent("Score 100%");

    const essayAttempt = screen.getByTestId("assessment-attempt-attempt-essay");

    expect(within(essayAttempt).getByText("Question 2")).toBeInTheDocument();

    expect(within(essayAttempt).getByText("Essay")).toBeInTheDocument();

    const essayEvaluation =
      within(essayAttempt).getByTestId("evaluation-section");

    expect(essayEvaluation).toHaveTextContent("Answer evaluated");
    expect(essayEvaluation).toHaveTextContent("Score 100%");
  });

  it("localizes result labels without translating persisted evidence", () => {
    render(<AssessmentResultView assessmentId="assessment-1" />, {
      locale: "id",
    });

    expect(
      screen.getByRole("heading", { name: "Tujuan Pembelajaran 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Progres")).toBeInTheDocument();
    expect(
      screen.getByText("Explain electric flux."),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("assessment-attempt-attempt-essay"),
    ).toHaveTextContent("Good physical reasoning.");
  });
});
