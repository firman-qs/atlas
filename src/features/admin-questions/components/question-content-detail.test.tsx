import { render, screen } from "@/test/render";
import { describe, expect, it } from "vitest";

import { QuestionContentDetail } from "@/features/admin-questions/components/question-content-detail";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

const mcqQuestion: AdminQuestionSummary = {
  id: "question-mcq",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "mcq",
  status: "draft",
  prompt: "Which answer is correct?",
  feedback: "Review the governing principle.",
  ai_guidelines: null,
  content: {
    type: "mcq",
    is_option_shuffled: true,
    options: [
      {
        id: "option-1",
        text: "Correct answer",
        is_correct: true,
        display_order: 1,
      },
      {
        id: "option-2",
        text: "Incorrect answer",
        is_correct: false,
        display_order: 2,
      },
    ],
  },
};

const essayQuestion: AdminQuestionSummary = {
  id: "question-essay",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "essay",
  status: "draft",
  prompt: "Explain the result.",
  feedback: null,
  ai_guidelines: "Evaluate conceptual reasoning.",
  content: {
    type: "essay",
    rubric: "Must explain the physical principle.",
    ideal_answer: "A complete answer explains the physical principle clearly.",
  },
};

describe("QuestionContentDetail", () => {
  it("renders MCQ options and identifies the correct answer", () => {
    render(<QuestionContentDetail question={mcqQuestion} />);

    expect(screen.getByText("Multiple-choice options")).toBeInTheDocument();
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Incorrect answer")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Options shuffled")).toBeInTheDocument();
  });

  it("renders the essay rubric and ideal answer", () => {
    render(<QuestionContentDetail question={essayQuestion} />);

    expect(screen.getByText("Rubric")).toBeInTheDocument();
    expect(
      screen.getByText("Must explain the physical principle."),
    ).toBeInTheDocument();

    expect(screen.getByText("Ideal answer")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A complete answer explains the physical principle clearly.",
      ),
    ).toBeInTheDocument();
  });
});
