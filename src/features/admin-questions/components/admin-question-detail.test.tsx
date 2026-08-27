import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminQuestionDetail } from "@/features/admin-questions/components/admin-question-detail";

vi.mock("@/features/admin-questions/queries", () => ({
  useAdminQuestion: vi.fn(),
}));

vi.mock("@/features/admin-concepts/queries", () => ({
  useConcept: vi.fn(),
}));

vi.mock("@/features/admin-courses/queries", () => ({
  useAdminCourse: vi.fn(),
}));

vi.mock("@/features/admin-learning-objectives/queries", () => ({
  useLearningObjectives: vi.fn(),
}));

vi.mock("@/features/admin-curriculum/queries", () => ({
  useAdminSoloLevels: vi.fn(),
}));

vi.mock(
  "@/features/admin-questions/components/question-lifecycle-actions",
  () => ({
    QuestionLifecycleActions: () => (
      <div data-testid="question-lifecycle-actions" />
    ),
  }),
);

import { useConcept } from "@/features/admin-concepts/queries";
import { useAdminCourse } from "@/features/admin-courses/queries";
import { useAdminSoloLevels } from "@/features/admin-curriculum/queries";
import { useLearningObjectives } from "@/features/admin-learning-objectives/queries";
import { useAdminQuestion } from "@/features/admin-questions/queries";

const mockedUseAdminQuestion = vi.mocked(useAdminQuestion);
const mockedUseConcept = vi.mocked(useConcept);
const mockedUseAdminCourse = vi.mocked(useAdminCourse);
const mockedUseLearningObjectives = vi.mocked(useLearningObjectives);
const mockedUseAdminSoloLevels = vi.mocked(useAdminSoloLevels);

describe("AdminQuestionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAdminQuestion.mockReturnValue({
      data: {
        id: "question-1",
        learning_objective_id: "lo-1",
        concept_id: "concept-1",
        solo_level_id: "solo-1",
        question_type: "mcq",
        status: "draft",
        prompt: "Determine the electric flux.",
        feedback: "Use Gauss's law.",
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
      },
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAdminQuestion>);

    mockedUseConcept.mockReturnValue({
      data: {
        id: "concept-1",
        course_id: "course-1",
        code: "ct-c001",
        name: "Electric Flux",
        description: "Electric flux concept",
      },
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useConcept>);

    mockedUseAdminCourse.mockReturnValue({
      data: {
        id: "course-1",
        code: "em001",
        title: "Electromagnetics",
        description: "Electromagnetics course",
        credits: 4,
        is_active: true,
      },
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAdminCourse>);

    mockedUseLearningObjectives.mockReturnValue({
      data: {
        total: 1,
        page: 1,
        page_size: 100,
        items: [
          {
            id: "lo-1",
            course_id: "course-1",
            code: "lo1",
            description: "First learning objective",
            display_order: 1,
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useLearningObjectives>);

    mockedUseAdminSoloLevels.mockReturnValue({
      data: [
        {
          id: "solo-1",
          code: "relational",
          level: 4,
          description: "Relational understanding",
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAdminSoloLevels>);
  });

  it("resolves and renders question curriculum metadata", () => {
    render(<AdminQuestionDetail questionId="question-1" />);

    expect(screen.getByText("EM001")).toBeInTheDocument();
    expect(screen.getByText("LO1")).toBeInTheDocument();
    expect(screen.getByText("ct-c001")).toBeInTheDocument();
    expect(screen.getByText("Electric Flux")).toBeInTheDocument();
    expect(screen.getByText("relational")).toBeInTheDocument();

    expect(
      screen.getByText("Determine the electric flux."),
    ).toBeInTheDocument();
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
  });
});
