import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditQuestionForm } from "@/features/admin-questions/components/edit-question-form";
import type { QuestionAuthoringFormValues } from "@/features/admin-questions/schemas";
import type { Control, UseFormSetValue } from "react-hook-form";

const mutateAsync = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock(
  "@/features/admin-questions/components/question-placement-fields",
  () => ({
    QuestionPlacementFields: () => (
      <div data-testid="question-placement">Curriculum placement</div>
    ),
  }),
);

vi.mock("@/features/admin-questions/components/question-common-fields", () => ({
  QuestionCommonFields: () => <div>Question common fields</div>,
}));

vi.mock(
  "@/features/admin-questions/components/mcq-question-fields",
  async () => {
    const { Controller, useFieldArray } = await import("react-hook-form");

    return {
      McqQuestionFields: ({
        control,
        setValue,
      }: {
        control: Control<QuestionAuthoringFormValues>;
        setValue: UseFormSetValue<QuestionAuthoringFormValues>;
      }) => {
        const { fields, append } = useFieldArray({
          control,
          name: "options",
          keyName: "fieldId",
        });

        return (
          <div>
            <div>MCQ fields</div>

            {fields.map((field, index) => (
              <div key={field.fieldId}>
                <Controller
                  control={control}
                  name={`options.${index}.text`}
                  render={({ field: optionField }) => (
                    <input
                      aria-label={`Option ${index + 1}`}
                      value={optionField.value}
                      onChange={optionField.onChange}
                    />
                  )}
                />

                <button
                  type="button"
                  aria-label={`Mark option ${index + 1} correct`}
                  onClick={() =>
                    setValue("correctOptionId", field.clientId, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Correct
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                append({
                  clientId: `test-option-${fields.length + 1}`,
                  text: "",
                })
              }
            >
              Add option
            </button>
          </div>
        );
      },
    };
  },
);

vi.mock(
  "@/features/admin-questions/components/essay-question-fields",
  async () => {
    const { Controller } = await import("react-hook-form");

    return {
      EssayQuestionFields: ({
        control,
      }: {
        control: Control<QuestionAuthoringFormValues>;
      }) => (
        <div>
          <div>Essay fields</div>

          <Controller
            control={control}
            name="rubric"
            render={({ field }) => (
              <input
                aria-label="Rubric"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="idealAnswer"
            render={({ field }) => (
              <input
                aria-label="Ideal answer"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      ),
    };
  },
);

vi.mock("@/features/admin-questions/queries", () => ({
  useUpdateAdminQuestion: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const mcqQuestion = {
  id: "question-1",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "mcq" as const,
  status: "draft" as const,
  prompt: "What is electric flux?",
  feedback: "Review Gauss's law.",
  ai_guidelines: null,
  content: {
    type: "mcq" as const,
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
};

const essayQuestion = {
  id: "question-2",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "essay" as const,
  status: "draft" as const,
  prompt: "Explain electric flux.",
  feedback: "Discuss the physical interpretation.",
  ai_guidelines: "Prioritize conceptual understanding.",
  content: {
    type: "essay" as const,
    rubric: "Explains flux and relates it to field lines.",
    ideal_answer: "Electric flux measures the field passing through a surface.",
  },
};

describe("EditQuestionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(mcqQuestion);
  });

  it("initializes an MCQ question and renders MCQ authoring fields", () => {
    render(<EditQuestionForm question={mcqQuestion} />);

    expect(screen.getByText("Edit Question")).toBeInTheDocument();
    expect(screen.getByText("Question common fields")).toBeInTheDocument();
    expect(screen.getByText("MCQ fields")).toBeInTheDocument();
    expect(screen.queryByText("Essay fields")).not.toBeInTheDocument();
  });

  it("shows curriculum placement as read-only metadata", () => {
    render(<EditQuestionForm question={mcqQuestion} />);

    expect(screen.getByTestId("question-placement")).toBeInTheDocument();

    expect(
      screen.getByText(/curriculum placement cannot be changed/i),
    ).toBeInTheDocument();
  });

  it("allows switching the authoring type from MCQ to Essay", () => {
    render(<EditQuestionForm question={mcqQuestion} />);

    fireEvent.click(screen.getByRole("combobox"));

    const essayOption = screen.getByRole("option", {
      name: /essay/i,
    });

    fireEvent.pointerDown(essayOption);
    fireEvent.pointerUp(essayOption);
    fireEvent.click(essayOption);

    expect(screen.getByText("Essay fields")).toBeInTheDocument();
    expect(screen.queryByText("MCQ fields")).not.toBeInTheDocument();

    expect(screen.getByText(/changing the question type/i)).toBeInTheDocument();
  });

  it("saves an existing MCQ as a complete MCQ update", async () => {
    render(<EditQuestionForm question={mcqQuestion} courseId="course-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        prompt: "What is electric flux?",
        feedback: "Review Gauss's law.",
        ai_guidelines: null,

        type: "mcq",
        is_option_shuffled: true,

        options: [
          {
            text: "Option A",
            is_correct: true,
            display_order: 1,
          },
          {
            text: "Option B",
            is_correct: false,
            display_order: 2,
          },
        ],
      });
    });
  });

  it("saves an existing Essay as a complete Essay update", async () => {
    mutateAsync.mockResolvedValue(essayQuestion);

    render(<EditQuestionForm question={essayQuestion} courseId="course-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        prompt: "Explain electric flux.",
        feedback: "Discuss the physical interpretation.",
        ai_guidelines: "Prioritize conceptual understanding.",

        type: "essay",
        rubric: "Explains flux and relates it to field lines.",
        ideal_answer:
          "Electric flux measures the field passing through a surface.",
      });
    });
  });

  it("converts an MCQ to Essay without submitting stale MCQ fields", async () => {
    mutateAsync.mockResolvedValue({
      ...essayQuestion,
      id: mcqQuestion.id,
      prompt: mcqQuestion.prompt,
      feedback: mcqQuestion.feedback,
      ai_guidelines: mcqQuestion.ai_guidelines,
    });

    render(<EditQuestionForm question={mcqQuestion} courseId="course-1" />);

    fireEvent.click(screen.getByRole("combobox"));

    const essayOption = screen.getByRole("option", {
      name: /essay/i,
    });

    fireEvent.pointerDown(essayOption);
    fireEvent.pointerUp(essayOption);
    fireEvent.click(essayOption);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /rubric/i,
      }),
      {
        target: {
          value: "Evaluate conceptual understanding of electric flux.",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /ideal answer/i,
      }),
      {
        target: {
          value: "Electric flux measures the electric field through a surface.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        prompt: "What is electric flux?",
        feedback: "Review Gauss's law.",
        ai_guidelines: null,

        type: "essay",

        rubric: "Evaluate conceptual understanding of electric flux.",
        ideal_answer:
          "Electric flux measures the electric field through a surface.",
      });
    });
  });

  it("converts an Essay to MCQ without submitting stale Essay fields", async () => {
    mutateAsync.mockResolvedValue({
      ...mcqQuestion,
      id: essayQuestion.id,
      prompt: essayQuestion.prompt,
      feedback: essayQuestion.feedback,
      ai_guidelines: essayQuestion.ai_guidelines,
    });

    render(<EditQuestionForm question={essayQuestion} courseId="course-1" />);

    fireEvent.click(screen.getByRole("combobox"));

    const mcqOption = screen.getByRole("option", {
      name: /multiple choice/i,
    });

    fireEvent.pointerDown(mcqOption);
    fireEvent.pointerUp(mcqOption);
    fireEvent.click(mcqOption);

    expect(screen.getByText("MCQ fields")).toBeInTheDocument();
    expect(screen.queryByText("Essay fields")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /add option/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /add option/i,
      }),
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Option 1",
      }),
      {
        target: {
          value: "Electric field passing through a surface",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Option 2",
      }),
      {
        target: {
          value: "Electric potential stored inside a surface",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark option 1 correct",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        prompt: "Explain electric flux.",
        feedback: "Discuss the physical interpretation.",
        ai_guidelines: "Prioritize conceptual understanding.",

        type: "mcq",
        is_option_shuffled: true,

        options: [
          {
            text: "Electric field passing through a surface",
            is_correct: true,
            display_order: 1,
          },
          {
            text: "Electric potential stored inside a surface",
            is_correct: false,
            display_order: 2,
          },
        ],
      });
    });
  });

  it("redirects to question detail after a successful update", async () => {
    render(<EditQuestionForm question={mcqQuestion} courseId="course-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });

    expect(push).toHaveBeenCalledWith("/admin/questions/question-1");
  });
});
