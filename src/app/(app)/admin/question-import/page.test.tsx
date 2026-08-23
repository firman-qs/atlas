import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/admin-question-import/components/question-import", () => ({
  QuestionImport: () => <div>Question Import Component</div>,
}));

import AdminQuestionImportPage from "./page";

describe("AdminQuestionImportPage", () => {
  it("renders the question import workspace", () => {
    render(<AdminQuestionImportPage />);

    expect(
      screen.getByRole("heading", {
        name: "Question Import",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Import an ATLAS question package from a TOML file."),
    ).toBeInTheDocument();

    expect(screen.getByText("Question Import Component")).toBeInTheDocument();
  });
});
