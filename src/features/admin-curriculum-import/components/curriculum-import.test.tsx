import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateAsync = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin-curriculum-import/queries", () => ({
  useImportCurriculum: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

import { CurriculumImport } from "@/features/admin-curriculum-import/components/curriculum-import";

describe("CurriculumImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imports a TOML curriculum package and renders the import statistics", async () => {
    mutateAsync.mockResolvedValue({
      course: {
        inserted: 1,
        skipped: 0,
      },
      learning_objectives: {
        inserted: 3,
        skipped: 0,
      },
      concepts: {
        inserted: 8,
        skipped: 0,
      },
      learning_objective_concepts: {
        inserted: 8,
        skipped: 0,
      },
      learning_objective_concept_levels: {
        inserted: 24,
        skipped: 0,
      },
    });

    render(<CurriculumImport />);

    const file = new File(
      [
        `
[course]
code = "um032em000"
title = "Electromagnetics"
description = "Electromagnetics course"
credits = 4
is_active = true
`,
      ],
      "curriculum.toml",
      {
        type: "application/toml",
      },
    );

    fireEvent.change(screen.getByLabelText(/curriculum package/i), {
      target: {
        files: [file],
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /import curriculum/i,
      }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(file);
    });

    expect(screen.getByText(/import completed/i)).toBeInTheDocument();

    expect(screen.getByText("Course")).toBeInTheDocument();
    expect(screen.getByText("Learning objectives")).toBeInTheDocument();
    expect(screen.getByText("Concepts")).toBeInTheDocument();
    expect(screen.getByText("LO–concept mappings")).toBeInTheDocument();
    expect(screen.getByText("Configured SOLO levels")).toBeInTheDocument();

    expect(screen.getByText("1 inserted · 0 skipped")).toBeInTheDocument();
    expect(screen.getByText("3 inserted · 0 skipped")).toBeInTheDocument();
    expect(screen.getAllByText("8 inserted · 0 skipped")).toHaveLength(2);
    expect(screen.getByText("24 inserted · 0 skipped")).toBeInTheDocument();
  });
});
