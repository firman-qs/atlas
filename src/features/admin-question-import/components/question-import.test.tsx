import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateAsync = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin-question-import/queries", () => ({
  useImportQuestions: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

import { QuestionImport } from "@/features/admin-question-import/components/question-import";

describe("QuestionImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imports a TOML question package and renders import statistics with skipped-question evidence", async () => {
    mutateAsync.mockResolvedValue({
      inserted: 7,
      skipped: 2,
      skipped_questions: [
        {
          learning_objective_code: "lo1",
          concept_code: "em-c001",
          solo_code: "unistructural",
          question_type: "mcq",
          prompt: "What is electric flux?",
          reason: "Question already exists.",
        },
        {
          learning_objective_code: "lo1",
          concept_code: "em-c002",
          solo_code: "relational",
          question_type: "essay",
          prompt: "Explain Gauss's law conceptually.",
          reason: "Question already exists.",
        },
      ],
    });

    render(<QuestionImport />);

    const file = new File(
      [
        `
[metadata]
course_code = "um032em000"
version = "1.0.0"
language = "en"

[[question]]
learning_objective_code = "lo1"
concept_code = "em-c001"
solo_code = "unistructural"
type = "mcq"
status = "published"
prompt = "What is electric flux?"
is_option_shuffled = true

[[question.option]]
text = "Surface integral of electric field."
is_correct = true
display_order = 1

[[question.option]]
text = "Line integral of magnetic field."
is_correct = false
display_order = 2
`,
      ],
      "questions.toml",
      {
        type: "application/toml",
      },
    );

    fireEvent.change(screen.getByLabelText(/question package/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /import questions/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(file);
    });

    expect(screen.getByText(/import completed/i)).toBeInTheDocument();

    expect(screen.getByText("7 inserted")).toBeInTheDocument();
    expect(screen.getByText("2 skipped")).toBeInTheDocument();

    expect(screen.getByText("Skipped questions")).toBeInTheDocument();

    expect(screen.getByText("What is electric flux?")).toBeInTheDocument();

    expect(
      screen.getByText("Explain Gauss's law conceptually."),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Question already exists.")).toHaveLength(2);

    expect(screen.getAllByText("LO1")).toHaveLength(2);
    expect(screen.getByText("em-c001")).toBeInTheDocument();
    expect(screen.getByText("Unistructural")).toBeInTheDocument();
    expect(screen.getByText("MCQ")).toBeInTheDocument();

    expect(screen.getByText("em-c002")).toBeInTheDocument();
    expect(screen.getByText("Relational")).toBeInTheDocument();
    expect(screen.getByText("Essay")).toBeInTheDocument();
  });
});
