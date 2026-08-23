import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminQuestionEdit } from "@/features/admin-questions/components/admin-question-edit";

vi.mock("@/features/admin-questions/queries", () => ({
  useAdminQuestion: () => ({
    data: {
      id: "question-1",
      learning_objective_id: "lo-1",
      concept_id: "concept-1",
      solo_level_id: "solo-1",
      question_type: "mcq",
      status: "draft",
      prompt: "What is electric flux?",
      feedback: null,
      ai_guidelines: null,
      content: {
        type: "mcq",
        is_option_shuffled: true,
        options: [
          {
            id: "option-1",
            text: "Option A",
            is_correct: true,
            display_order: 1,
          },
          {
            id: "option-2",
            text: "Option B",
            is_correct: false,
            display_order: 2,
          },
        ],
      },
    },
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/admin-concepts/queries", () => ({
  useConcept: () => ({
    data: {
      id: "concept-1",
      course_id: "course-1",
      code: "ct-c001",
      name: "Electric flux",
      description: "",
    },
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/admin-questions/components/edit-question-form", () => ({
  EditQuestionForm: ({
    question,
    courseId,
  }: {
    question: { id: string };
    courseId?: string;
  }) => (
    <div>
      <div>Edit form for {question.id}</div>
      <div>Course {courseId}</div>
    </div>
  ),
}));

describe("AdminQuestionEdit", () => {
  it("loads the question and resolves its course before rendering the edit form", () => {
    render(<AdminQuestionEdit questionId="question-1" />);

    expect(screen.getByText("Edit form for question-1")).toBeInTheDocument();
    expect(screen.getByText("Course course-1")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /question detail/i,
      }),
    ).toHaveAttribute("href", "/admin/questions/question-1");
  });
});
