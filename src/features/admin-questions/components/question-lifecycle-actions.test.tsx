import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuestionLifecycleActions } from "@/features/admin-questions/components/question-lifecycle-actions";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/admin-questions/queries", () => ({
  usePublishAdminQuestion: vi.fn(),
  useUnpublishAdminQuestion: vi.fn(),
  useDeleteAdminQuestion: vi.fn(),
}));

import {
  useDeleteAdminQuestion,
  usePublishAdminQuestion,
  useUnpublishAdminQuestion,
} from "@/features/admin-questions/queries";

const mockedUsePublishAdminQuestion = vi.mocked(usePublishAdminQuestion);
const mockedUseUnpublishAdminQuestion = vi.mocked(useUnpublishAdminQuestion);
const mockedUseDeleteAdminQuestion = vi.mocked(useDeleteAdminQuestion);

const baseQuestion: AdminQuestionSummary = {
  id: "question-1",
  learning_objective_id: "lo-1",
  concept_id: "concept-1",
  solo_level_id: "solo-1",
  question_type: "mcq",
  status: "draft",
  prompt: "Determine the electric flux.",
  feedback: null,
  ai_guidelines: null,
  content: {
    type: "mcq",
    is_option_shuffled: true,
    options: [
      {
        id: "option-1",
        text: "Correct",
        is_correct: true,
        display_order: 1,
      },
      {
        id: "option-2",
        text: "Incorrect",
        is_correct: false,
        display_order: 2,
      },
    ],
  },
};

function mutationMock() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  };
}

describe("QuestionLifecycleActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUsePublishAdminQuestion.mockReturnValue(
      mutationMock() as unknown as ReturnType<typeof usePublishAdminQuestion>,
    );

    mockedUseUnpublishAdminQuestion.mockReturnValue(
      mutationMock() as unknown as ReturnType<typeof useUnpublishAdminQuestion>,
    );

    mockedUseDeleteAdminQuestion.mockReturnValue(
      mutationMock() as unknown as ReturnType<typeof useDeleteAdminQuestion>,
    );
  });

  it("shows edit, publish, and delete actions for a draft question", () => {
    render(<QuestionLifecycleActions question={baseQuestion} />);

    expect(
      screen.getByRole("button", { name: "Edit question" }),
    ).toHaveAttribute("href", "/admin/questions/question-1/edit");

    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Delete question" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Unpublish" }),
    ).not.toBeInTheDocument();
  });

  it("shows only unpublish for a published question", () => {
    render(
      <QuestionLifecycleActions
        question={{
          ...baseQuestion,
          status: "published",
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Unpublish" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit question" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Publish" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Delete question" }),
    ).not.toBeInTheDocument();
  });

  it("publishes a draft question", async () => {
    const publishMutation = mutationMock();

    mockedUsePublishAdminQuestion.mockReturnValue(
      publishMutation as unknown as ReturnType<typeof usePublishAdminQuestion>,
    );

    render(<QuestionLifecycleActions question={baseQuestion} />);

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(publishMutation.mutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("requires confirmation before deleting and redirects after success", async () => {
    const deleteMutation = mutationMock();

    mockedUseDeleteAdminQuestion.mockReturnValue(
      deleteMutation as unknown as ReturnType<typeof useDeleteAdminQuestion>,
    );

    render(<QuestionLifecycleActions question={baseQuestion} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete question" }));

    expect(screen.getByText("Delete question?")).toBeInTheDocument();

    expect(deleteMutation.mutateAsync).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete question permanently",
      }),
    );

    await waitFor(() => {
      expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("question-1");
    });

    expect(push).toHaveBeenCalledWith("/admin/questions");
  });
});
