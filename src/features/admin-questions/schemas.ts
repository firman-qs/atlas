import { z } from "zod";

const mcqOptionSchema = z.object({
  clientId: z.string().min(1),
  text: z.string(),
});

export const questionAuthoringSchema = z
  .object({
    courseId: z.string().min(1, "Course is required."),
    learningObjectiveId: z.string().min(1, "Learning objective is required."),
    conceptId: z.string().min(1, "Concept is required."),
    soloLevelId: z.string().min(1, "SOLO level is required."),
    questionType: z.enum(["mcq", "essay"]),
    prompt: z.string().trim().min(1, "Question prompt is required."),
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
          message: "A multiple-choice question requires at least two options.",
        });
      }

      values.options.forEach((option, index) => {
        if (option.text.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["options", index, "text"],
            message: "Option text is required.",
          });
        }
      });

      if (!values.correctOptionId) {
        ctx.addIssue({
          code: "custom",
          path: ["correctOptionId"],
          message: "Select the correct answer.",
        });
      } else {
        const correctExists = values.options.some(
          (option) => option.clientId === values.correctOptionId,
        );

        if (!correctExists) {
          ctx.addIssue({
            code: "custom",
            path: ["correctOptionId"],
            message: "The selected correct answer is invalid.",
          });
        }
      }
    }

    if (values.questionType === "essay") {
      if (values.rubric.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["rubric"],
          message: "Essay rubric is required.",
        });
      }

      if (values.idealAnswer.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["idealAnswer"],
          message: "Ideal answer is required.",
        });
      }
    }
  });

export type QuestionAuthoringFormValues = z.infer<
  typeof questionAuthoringSchema
>;
