import { describe, expect, it } from "vitest";

import { createQuestionAuthoringSchema } from "@/features/admin-questions/schemas";
import idMessages from "@/messages/id.json";

const messages = idMessages.admin.validation;
const t = (key: keyof typeof messages) => messages[key];

const base = {
  courseId: "course-1",
  learningObjectiveId: "objective-1",
  conceptId: "concept-1",
  soloLevelId: "solo-1",
  prompt: "Prompt backend tetap sama",
  feedback: "",
  aiGuidelines: "",
  isOptionShuffled: false,
  correctOptionId: "",
  options: [],
  rubric: "",
  idealAnswer: "",
};

describe("question authoring validation localization", () => {
  it("localizes MCQ validation while preserving its constraints and paths", () => {
    const result = createQuestionAuthoringSchema(t).safeParse({
      ...base,
      questionType: "mcq",
    });

    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["options"],
          message: "Soal pilihan ganda memerlukan setidaknya dua opsi.",
        }),
        expect.objectContaining({
          path: ["correctOptionId"],
          message: "Pilih jawaban yang benar.",
        }),
      ]),
    );
  });

  it("localizes essay validation while preserving its constraints and paths", () => {
    const result = createQuestionAuthoringSchema(t).safeParse({
      ...base,
      questionType: "essay",
    });

    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["rubric"],
          message: "Rubrik esai wajib diisi.",
        }),
        expect.objectContaining({
          path: ["idealAnswer"],
          message: "Jawaban ideal wajib diisi.",
        }),
      ]),
    );
  });
});
