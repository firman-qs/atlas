import { render, screen } from "@testing-library/react";
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
  });
});
