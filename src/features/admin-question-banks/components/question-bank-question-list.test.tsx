import { render, screen } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuestionBankQuestionList } from "@/features/admin-question-banks/components/question-bank-question-list";

const useQuestionBankQuestions = vi.hoisted(() => vi.fn());
const useDetachQuestionFromBank = vi.hoisted(() => vi.fn());

const useAdminLearningObjectives = vi.hoisted(() => vi.fn());
const useAdminConcepts = vi.hoisted(() => vi.fn());
const useAdminSoloLevels = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin-question-banks/queries", () => ({
  useQuestionBankQuestions,
  useDetachQuestionFromBank,

  // This intentionally fails if the component still needs to load every
  // course question merely to resolve bank-question placement metadata.
  useAdminQuestions: () => {
    throw new Error(
      "QuestionBankQuestionList must not load the course question library.",
    );
  },
}));

vi.mock("@/features/admin-curriculum/queries", () => ({
  useAdminLearningObjectives,
  useAdminConcepts,
  useAdminSoloLevels,
}));

describe("QuestionBankQuestionList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useQuestionBankQuestions.mockReturnValue({
      data: {
        total: 1,
        page: 1,
        page_size: 100,
        items: [
          {
            id: "question-1",

            learning_objective_id: "lo-1",
            concept_id: "concept-1",
            solo_level_id: "solo-1",

            concept_level_id: "loc-level-1",
            question_type: "mcq",
            status: "published",
            prompt: "What is electric flux?",
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useDetachQuestionFromBank.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      variables: undefined,
    });

    useAdminLearningObjectives.mockReturnValue({
      data: {
        total: 1,
        page: 1,
        page_size: 100,
        items: [
          {
            id: "lo-1",
            course_id: "course-1",
            code: "lo1",
            description: "Understand electric flux.",
            display_order: 1,
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useAdminConcepts.mockReturnValue({
      data: {
        total: 1,
        page: 1,
        page_size: 100,
        items: [
          {
            id: "concept-1",
            course_id: "course-1",
            code: "em-c001",
            name: "Electric Flux",
            description: "Electric flux through surfaces.",
          },
        ],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useAdminSoloLevels.mockReturnValue({
      data: [
        {
          id: "solo-1",
          code: "unistructural",
          level: 1,
          description: "Single relevant aspect.",
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("renders placement metadata directly from the bank-question response without loading the full course question library", () => {
    render(
      <QuestionBankQuestionList questionBankId="bank-1" courseId="course-1" />,
    );

    expect(screen.getByText("LO1")).toBeInTheDocument();
    expect(screen.getByText("Electric Flux")).toBeInTheDocument();
    expect(screen.getByText("unistructural")).toBeInTheDocument();

    expect(screen.queryByText("Unknown LO")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown concept")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown SOLO level")).not.toBeInTheDocument();

    expect(screen.getByText("What is electric flux?")).toBeInTheDocument();
  });
});
