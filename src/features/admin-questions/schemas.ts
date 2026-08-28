import { z } from "zod";

import type { AdminValidationTranslator } from "@/features/admin-validation";

const mcqOptionSchema = z.object({
  clientId: z.string().min(1),
  text: z.string(),
});

export function createQuestionAuthoringSchema(t: AdminValidationTranslator) {
  return z
    .object({
      courseId: z.string().min(1, t("courseRequired")),
      learningObjectiveId: z.string().min(1, t("learningObjectiveRequired")),
      conceptId: z.string().min(1, t("conceptRequired")),
      soloLevelId: z.string().min(1, t("soloLevelRequired")),
      questionType: z.enum(["mcq", "essay"]),
      prompt: z.string().trim().min(1, t("questionPromptRequired")),
      feedback: z.string(),
      aiGuidelines: z.string(),
      isOptionShuffled: z.boolean(),
      correctOptionId: z.string(),
      options: z.array(mcqOptionSchema),
      rubric: z.string(),
      idealAnswer: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.questionType === "mcq") {
        if (values.options.length < 2) {
          ctx.addIssue({
            code: "custom",
            path: ["options"],
            message: t("mcqMinOptions"),
          });
        }

        values.options.forEach((option, index) => {
          if (option.text.trim() === "") {
            ctx.addIssue({
              code: "custom",
              path: ["options", index, "text"],
              message: t("optionTextRequired"),
            });
          }
        });

        if (!values.correctOptionId) {
          ctx.addIssue({
            code: "custom",
            path: ["correctOptionId"],
            message: t("selectCorrectAnswer"),
          });
        } else {
          const correctExists = values.options.some(
            (option) => option.clientId === values.correctOptionId,
          );

          if (!correctExists) {
            ctx.addIssue({
              code: "custom",
              path: ["correctOptionId"],
              message: t("correctAnswerInvalid"),
            });
          }
        }
      }

      if (values.questionType === "essay") {
        if (values.rubric.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["rubric"],
            message: t("essayRubricRequired"),
          });
        }

        if (values.idealAnswer.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["idealAnswer"],
            message: t("idealAnswerRequired"),
          });
        }
      }
    });
}

export type QuestionAuthoringFormValues = z.infer<
  ReturnType<typeof createQuestionAuthoringSchema>
>;
