import { describe, expect, it } from "vitest";

import { createAcademicTermSchema } from "@/features/admin-academic-terms/components/create-academic-term-form";
import { editAcademicTermSchema } from "@/features/admin-academic-terms/components/edit-academic-term-form";
import { createConceptSchema } from "@/features/admin-concepts/components/create-concept-form";
import { editConceptSchema } from "@/features/admin-concepts/components/edit-concept-form";
import { createCourseSchema } from "@/features/admin-courses/components/create-course-form";
import { editCourseSchema } from "@/features/admin-courses/components/edit-course-form";
import { createLearningObjectiveSchema } from "@/features/admin-learning-objectives/components/create-learning-objective-form";
import { editLearningObjectiveSchema } from "@/features/admin-learning-objectives/components/edit-learning-objective-form";
import { createQuestionBankSchema } from "@/features/admin-question-banks/components/create-question-bank-form";
import { editQuestionBankSchema } from "@/features/admin-question-banks/components/edit-question-bank-form";
import idMessages from "@/messages/id.json";

const messages = idMessages.admin.validation;
const t = (key: keyof typeof messages) => messages[key];

describe("administrator validation localization", () => {
  it("uses Indonesian messages without changing academic-term constraints", () => {
    for (const schema of [
      createAcademicTermSchema(t),
      editAcademicTermSchema(t),
    ]) {
      const result = schema.safeParse({
        year: 1999,
        semester: "ganjil",
        starts_at: "2026-08-02",
        ends_at: "2026-08-01",
      });

      expect(result.error?.issues.map((issue) => issue.message)).toEqual([
        "Tahun harus 2000 atau setelahnya.",
        "Tanggal selesai harus sama dengan atau setelah tanggal mulai.",
      ]);
    }
  });

  it("uses Indonesian messages for concept, course, objective, and bank schemas", () => {
    const cases = [
      [
        createConceptSchema(t),
        { code: "", name: "", description: "" },
        "Kode konsep wajib diisi.",
      ],
      [
        editConceptSchema(t),
        { code: "", name: "", description: "" },
        "Kode konsep wajib diisi.",
      ],
      [
        createCourseSchema(t),
        { code: "", title: "", description: "", credits: 0 },
        "Kode mata kuliah wajib diisi.",
      ],
      [
        editCourseSchema(t),
        { code: "", title: "", description: "", credits: 0 },
        "Kode mata kuliah wajib diisi.",
      ],
      [
        createLearningObjectiveSchema(t),
        { code: "", description: "" },
        "Kode tujuan pembelajaran wajib diisi.",
      ],
      [
        editLearningObjectiveSchema(t),
        { code: "", description: "" },
        "Kode tujuan pembelajaran wajib diisi.",
      ],
      [
        createQuestionBankSchema(t),
        {
          course_id: "",
          code: "",
          name: "",
          description: "",
          is_student_selectable: false,
        },
        "Mata kuliah wajib dipilih.",
      ],
      [
        editQuestionBankSchema(t),
        {
          code: "",
          name: "",
          description: "",
          is_student_selectable: false,
        },
        "Kode wajib diisi.",
      ],
    ] as const;

    for (const [schema, value, expectedFirstMessage] of cases) {
      const result = schema.safeParse(value);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(expectedFirstMessage);
    }
  });
});
