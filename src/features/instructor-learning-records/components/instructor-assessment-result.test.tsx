import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorAssessmentResult } from "@/features/instructor-learning-records/components/instructor-assessment-result";

const mockedUseInstructorAssessmentResult = vi.hoisted(() => vi.fn());

vi.mock("@/features/instructor-learning-records/queries", () => ({
  useInstructorAssessmentResult: mockedUseInstructorAssessmentResult,
}));

describe("InstructorAssessmentResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseInstructorAssessmentResult.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        assessment_id: "assessment-1",
        mode: "progress",
        status: "completed",
        question_bank: {
          id: "bank-1",
          code: "main",
          name: "Main Question Bank",
        },
        review_target: null,
        started_at: "2026-08-20T08:00:00+07:00",
        completed_at: "2026-08-20T09:00:00+07:00",
        learning_objective: {
          id: "lo-1",
          code: "lo1",
          description: "Explain electromagnetic concepts.",
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
                solo_code: "unistructural",
                solo_level: 1,
                display_order: 1,
                cycles: [
                  {
                    cycle_number: 1,
                    score: 0.5,
                    mastery_threshold: 0.8,
                    passed: false,
                    completed_at: "2026-08-20T08:30:00+07:00",
                    attempts: [
                      {
                        attempt_id: "attempt-1",
                        question_id: "question-1",
                        question_type: "mcq",
                        question_content: {
                          type: "mcq",
                          options: [
                            {
                              id: "option-1",
                              text: "$\\Phi_E = q / \\epsilon_0$",
                            },
                            {
                              id: "option-2",
                              text: "Magnetic flux",
                            },
                          ],
                        },
                        prompt:
                          "What quantity is represented by **electric flux** $\\Phi_E$?",
                        answer: {
                          option_id: "option-1",
                        },
                        is_correct: true,
                        score: 1,
                        feedback:
                          "Correct. **Gauss's law** gives $\\Phi_E = q / \\epsilon_0$.",
                        evaluation_metadata: null,
                        submitted_at: "2026-08-20T08:10:00+07:00",
                        evaluated_at: "2026-08-20T08:10:01+07:00",
                      },
                      {
                        attempt_id: "attempt-2",
                        question_id: "question-2",
                        question_type: "essay",
                        question_content: {
                          type: "essay",
                        },
                        prompt: "Explain electric flux through a surface.",
                        answer: {
                          text: "The field scales as **$1/r^2$** over the spherical surface.",
                        },
                        is_correct: null,
                        score: 0.7,
                        feedback:
                          "Good explanation, but expand the **surface orientation** argument.",
                        evaluation_metadata: null,
                        submitted_at: "2026-08-20T08:20:00+07:00",
                        evaluated_at: "2026-08-20T08:20:05+07:00",
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

  it("renders persisted assessment evidence for the instructor", () => {
    const { container } = render(
      <InstructorAssessmentResult
        courseOfferingId="offering-1"
        learningRecordId="learning-record-1"
        assessmentId="assessment-1"
      />,
    );

    expect(mockedUseInstructorAssessmentResult).toHaveBeenCalledWith(
      "offering-1",
      "assessment-1",
    );

    expect(screen.getByText("LO1")).toBeInTheDocument();

    expect(
      screen.getByText("Explain electromagnetic concepts."),
    ).toBeInTheDocument();

    expect(screen.getByText("Main Question Bank")).toBeInTheDocument();

    expect(screen.getByText("Electric Flux")).toBeInTheDocument();
    expect(screen.getByText("em-c001")).toBeInTheDocument();
    expect(screen.getByText("Unistructural")).toBeInTheDocument();

    expect(screen.getByText("Cycle 1")).toBeInTheDocument();
    expect(screen.getByText("Score 50%")).toBeInTheDocument();
    expect(screen.getByText("Required 80%")).toBeInTheDocument();
    expect(screen.getByText("Not mastered")).toBeInTheDocument();

    expect(
      screen.getByText("Explain electric flux through a surface."),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Student answer")).toHaveLength(2);

    // Markdown in the persisted question prompt.
    expect(screen.getByText("electric flux")).toHaveProperty(
      "tagName",
      "STRONG",
    );

    // Markdown in persisted evaluation feedback.
    expect(screen.getByText("Gauss's law")).toHaveProperty("tagName", "STRONG");

    expect(screen.getByText("surface orientation")).toHaveProperty(
      "tagName",
      "STRONG",
    );

    expect(
      Array.from(
        container.querySelectorAll(".atlas-rich-text-viewer strong"),
      ).some((element) => element.querySelector(".katex") !== null),
    ).toBe(true);

    // Question prompt, MCQ answer, feedback, and essay answer contain
    // mathematical notation rendered through KaTeX.
    expect(container.querySelectorAll(".katex").length).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", {
        name: /learning record/i,
      }),
    ).toHaveAttribute(
      "href",
      "/instructor/course-offerings/offering-1/learning-records/learning-record-1",
    );
  });
});
