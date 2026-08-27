"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { EssayQuestionFields } from "@/features/admin-questions/components/essay-question-fields";
import { McqQuestionFields } from "@/features/admin-questions/components/mcq-question-fields";
import { QuestionCommonFields } from "@/features/admin-questions/components/question-common-fields";
import {
  QuestionPlacementFields,
  type QuestionPlacementValue,
} from "@/features/admin-questions/components/question-placement-fields";
import { useUpdateAdminQuestion } from "@/features/admin-questions/queries";
import {
  questionAuthoringSchema,
  type QuestionAuthoringFormValues,
} from "@/features/admin-questions/schemas";
import type {
  AdminQuestionSummary,
  UpdateAdminQuestionRequest,
} from "@/features/admin-questions/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

interface EditQuestionFormProps {
  question: AdminQuestionSummary;
  courseId?: string;
}

function createInitialValues(
  question: AdminQuestionSummary,
  courseId?: string,
): QuestionAuthoringFormValues {
  if (question.content.type === "mcq") {
    return {
      courseId: courseId ?? "",
      learningObjectiveId: question.learning_objective_id,
      conceptId: question.concept_id,
      soloLevelId: question.solo_level_id,

      questionType: "mcq",

      prompt: question.prompt,
      feedback: question.feedback ?? "",
      aiGuidelines: question.ai_guidelines ?? "",

      isOptionShuffled: question.content.is_option_shuffled,

      correctOptionId:
        question.content.options.find((option) => option.is_correct)?.id ?? "",

      options: question.content.options.map((option) => ({
        clientId: option.id,
        text: option.text,
      })),

      rubric: "",
      idealAnswer: "",
    };
  }

  return {
    courseId: courseId ?? "",
    learningObjectiveId: question.learning_objective_id,
    conceptId: question.concept_id,
    soloLevelId: question.solo_level_id,

    questionType: "essay",

    prompt: question.prompt,
    feedback: question.feedback ?? "",
    aiGuidelines: question.ai_guidelines ?? "",

    isOptionShuffled: true,
    correctOptionId: "",
    options: [],

    rubric: question.content.rubric,
    idealAnswer: question.content.ideal_answer,
  };
}

function optionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized === "" ? null : normalized;
}

export function EditQuestionForm({
  question,
  courseId,
}: EditQuestionFormProps) {
  const t = useTranslations("admin.questions");
  const tForm = useTranslations("admin.questions.form");
  const tPlacement = useTranslations("admin.questions.placement");

  const form = useForm<QuestionAuthoringFormValues>({
    resolver: zodResolver(questionAuthoringSchema),
    defaultValues: createInitialValues(question, courseId),
  });

  const router = useRouter();

  const updateQuestion = useUpdateAdminQuestion(question.id);

  const questionType =
    useWatch({
      control: form.control,
      name: "questionType",
    }) ?? question.question_type;

  const placement: QuestionPlacementValue = {
    courseId,
    learningObjectiveId: question.learning_objective_id,
    conceptId: question.concept_id,
    soloLevelId: question.solo_level_id,
  };

  const questionTypeChanged = questionType !== question.question_type;

  async function onSubmit(values: QuestionAuthoringFormValues) {
    let request: UpdateAdminQuestionRequest;

    if (values.questionType === "mcq") {
      request = {
        prompt: values.prompt.trim(),
        feedback: optionalText(values.feedback),
        ai_guidelines: optionalText(values.aiGuidelines),

        type: "mcq",
        is_option_shuffled: values.isOptionShuffled,

        options: values.options.map((option, index) => ({
          text: option.text.trim(),
          is_correct: option.clientId === values.correctOptionId,
          display_order: index + 1,
        })),
      };
    } else {
      request = {
        prompt: values.prompt.trim(),
        feedback: optionalText(values.feedback),
        ai_guidelines: optionalText(values.aiGuidelines),

        type: "essay",
        rubric: values.rubric.trim(),
        ideal_answer: values.idealAnswer.trim(),
      };
    }

    try {
      await updateQuestion.mutateAsync(request);
      router.push(`/admin/questions/${question.id}`);
    } catch {
      // Mutation state will render the API error in a later increment.
    }
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{tForm("editTitle")}</h1>

        <p className="mt-1 text-muted-foreground">
          {tForm("editDescription")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tPlacement("title")}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {tPlacement("editDescription")}
          </p>
        </CardHeader>

        <CardContent>
          <QuestionPlacementFields
            value={placement}
            onChange={() => undefined}
            disabled
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tForm("typeTitle")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="max-w-sm">
            <Select
              value={questionType}
              disabled={updateQuestion.isPending}
              onValueChange={(value) => {
                if (value === "mcq" || value === "essay") {
                  form.setValue("questionType", value, {
                    shouldDirty: true,
                  });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <span>
                  {questionType === "mcq" ? t("types.mcq") : t("types.essay")}
                </span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="mcq">{t("types.mcq")}</SelectItem>
                <SelectItem value="essay">{t("types.essay")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionTypeChanged && (
            <p className="text-sm text-destructive">
              {tForm("typeChangedWarning")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tForm("contentTitle")}</CardTitle>
        </CardHeader>

        <CardContent>
          <QuestionCommonFields
            control={form.control}
            disabled={updateQuestion.isPending}
            register={form.register}
            errors={form.formState.errors}
          />
        </CardContent>
      </Card>

      {questionType === "mcq" && (
        <Card>
          <CardHeader>
            <CardTitle>{tForm("mcqTitle")}</CardTitle>
          </CardHeader>

          <CardContent>
            <McqQuestionFields
              control={form.control}
              disabled={updateQuestion.isPending}
              setValue={form.setValue}
              errors={form.formState.errors}
            />
          </CardContent>
        </Card>
      )}

      {questionType === "essay" && (
        <Card>
          <CardHeader>
            <CardTitle>{tForm("essayTitle")}</CardTitle>
          </CardHeader>

          <CardContent>
            <EssayQuestionFields
              control={form.control}
              disabled={updateQuestion.isPending}
              errors={form.formState.errors}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={updateQuestion.isPending}>
          {updateQuestion.isPending && <Loader2 className="animate-spin" />}
          {updateQuestion.isPending ? tForm("saving") : tForm("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
