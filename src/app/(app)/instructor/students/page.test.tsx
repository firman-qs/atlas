import { render, screen } from "@/test/render";
import { describe, expect, it, vi } from "vitest";

import InstructorStudentsPage from "@/app/(app)/instructor/students/page";

vi.mock(
  "@/features/instructor-students/components/instructor-student-list",
  () => ({ InstructorStudentList: () => <div>Daftar fixture</div> }),
);

describe("InstructorStudentsPage", () => {
  it("localizes its static page introduction", () => {
    render(<InstructorStudentsPage />, { locale: "id" });

    expect(
      screen.getByRole("heading", { name: "Mahasiswa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Jelajahi akun mahasiswa aktif yang tersedia untuk pendaftaran yang dikelola pengajar.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Daftar fixture")).toBeInTheDocument();
  });
});
