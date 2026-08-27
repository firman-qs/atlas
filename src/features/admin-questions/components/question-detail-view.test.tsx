import { render, screen } from "@/test/render";
import { describe, expect, it } from "vitest";

import { QuestionDetailView } from "@/features/admin-questions/components/question-detail-view";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

const question: AdminQuestionSummary = {
  id: "question-1",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "mcq",
  status: "draft",
  prompt: "Determine the electric flux through the surface.",
  feedback: "Apply Gauss's law carefully.",
  ai_guidelines: "Focus on conceptual reasoning.",
  content: {
    type: "mcq",
    is_option_shuffled: true,
    options: [
      {
        id: "option-1",
        text: "Correct flux",
        is_correct: true,
        display_order: 1,
      },
      {
        id: "option-2",
        text: "Incorrect flux",
        is_correct: false,
        display_order: 2,
      },
    ],
  },
};

describe("QuestionDetailView", () => {
  it("renders question identity, placement, prompt, and supporting content", () => {
    render(
      <QuestionDetailView
        question={question}
        courseCode="coursetest001"
        learningObjectiveCode="lo-temp1"
        conceptCode="ct-c001"
        conceptName="First Test Concept"
        soloLevelCode="prestructural"
      />,
    );

    expect(screen.getByText("MCQ")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();

    expect(screen.getByText("COURSETEST001")).toBeInTheDocument();
    expect(screen.getByText("LO-TEMP1")).toBeInTheDocument();
    expect(screen.getByText("ct-c001")).toBeInTheDocument();
    expect(screen.getByText("First Test Concept")).toBeInTheDocument();
    expect(screen.getByText("prestructural")).toBeInTheDocument();

    expect(
      screen.getByText("Determine the electric flux through the surface."),
    ).toBeInTheDocument();

    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(
      screen.getByText("Apply Gauss's law carefully."),
    ).toBeInTheDocument();

    expect(screen.getByText("AI guidelines")).toBeInTheDocument();
    expect(
      screen.getByText("Focus on conceptual reasoning."),
    ).toBeInTheDocument();

    expect(screen.getByText("Correct flux")).toBeInTheDocument();
    expect(screen.getByText("Incorrect flux")).toBeInTheDocument();
  });

  it("handles absent optional feedback and AI guidelines", () => {
    render(
      <QuestionDetailView
        question={{
          ...question,
          feedback: null,
          ai_guidelines: null,
        }}
        learningObjectiveCode="lo-temp1"
        conceptName="First Test Concept"
        soloLevelCode="prestructural"
      />,
    );

    expect(screen.getByText("No feedback provided.")).toBeInTheDocument();
    expect(screen.getByText("No AI guidelines provided.")).toBeInTheDocument();
  });
});
