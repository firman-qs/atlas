import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateQuestionForm } from "@/features/admin-questions/components/create-question-form";
import type { QuestionAuthoringFormValues } from "@/features/admin-questions/schemas";
import type { Control, UseFormSetValue } from "react-hook-form";

const push = vi.hoisted(() => vi.fn());
const mutateAsync = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock(
  "@/features/admin-questions/components/question-placement-fields",
  () => ({
    QuestionPlacementFields: ({
      onChange,
    }: {
      onChange: (value: {
        courseId?: string;
        learningObjectiveId?: string;
        conceptId?: string;
        soloLevelId?: string;
      }) => void;
    }) => (
      <button
        type="button"
        onClick={() =>
          onChange({
            courseId: "course-1",
            learningObjectiveId: "lo-1",
            conceptId: "concept-1",
            soloLevelId: "solo-1",
          })
        }
      >
        Select placement
      </button>
    ),
  }),
);

vi.mock(
  "@/features/admin-questions/components/question-common-fields",
  async () => {
    const { Controller } = await import("react-hook-form");

    return {
      QuestionCommonFields: ({
        control,
      }: {
        control: Control<QuestionAuthoringFormValues>;
      }) => (
        <div>
          <Controller
            control={control}
            name="prompt"
            render={({ field }) => (
              <input
                aria-label="Question prompt"
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
        const { fields } = useFieldArray({
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
          </div>
        );
      },
    };
  },
);

vi.mock("@/features/admin-questions/components/essay-question-fields", () => ({
  EssayQuestionFields: () => <div>Essay fields</div>,
}));

vi.mock("@/features/admin-questions/queries", () => ({
  useCreateAdminQuestion: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const createdQuestion = {
  id: "question-created-1",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "mcq" as const,
  status: "draft" as const,
  prompt: "What is electric flux?",
  feedback: null,
  ai_guidelines: null,
  content: {
    type: "mcq" as const,
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

describe("CreateQuestionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(createdQuestion);
  });

  it("redirects to the created question detail after a successful save", async () => {
    render(<CreateQuestionForm />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /select placement/i,
      }),
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: /question prompt/i,
      }),
      {
        target: {
          value: "What is electric flux?",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Option 1",
      }),
      {
        target: {
          value: "Correct answer",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Option 2",
      }),
      {
        target: {
          value: "Incorrect answer",
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
        name: /save draft/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        learning_objective_id: "lo-1",
        concept_id: "concept-1",
        solo_level_id: "solo-1",

        prompt: "What is electric flux?",
        feedback: null,
        ai_guidelines: null,

        type: "mcq",
        is_option_shuffled: true,

        options: [
          {
            text: "Correct answer",
            is_correct: true,
            display_order: 1,
          },
          {
            text: "Incorrect answer",
            is_correct: false,
            display_order: 2,
          },
        ],
      });
    });

    expect(push).toHaveBeenCalledWith("/admin/questions/question-created-1");
  });
});
