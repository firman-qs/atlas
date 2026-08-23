import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock(
  "@/features/admin-curriculum-import/components/curriculum-import",
  () => ({
    CurriculumImport: () => (
      <div data-testid="curriculum-import">Curriculum Import Component</div>
    ),
  }),
);

import AdminCurriculumImportPage from "./page";

describe("AdminCurriculumImportPage", () => {
  it("renders the curriculum import workspace", () => {
    render(<AdminCurriculumImportPage />);

    expect(screen.getByTestId("curriculum-import")).toBeInTheDocument();
  });
});
