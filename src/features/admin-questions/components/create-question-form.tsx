"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useCreateAdminQuestion } from "@/features/admin-questions/queries";
import {
  createQuestionAuthoringSchema,
  type QuestionAuthoringFormValues,
} from "@/features/admin-questions/schemas";
import type { CreateAdminQuestionRequest } from "@/features/admin-questions/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

function createEmptyMcqOption() {
  return {
    clientId: crypto.randomUUID(),
    text: "",
  };
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

export function CreateQuestionForm() {
  const t = useTranslations("admin.questions");
  const tForm = useTranslations("admin.questions.form");
  const tPlacement = useTranslations("admin.questions.placement");
  const tDetail = useTranslations("admin.questions.detail");
  const tErrors = useTranslations("admin.errors");
  const tValidation = useTranslations("admin.validation");
  const common = useTranslations("common");

  const [initialOptions] = useState(() => [
    createEmptyMcqOption(),
    createEmptyMcqOption(),
  ]);

  const router = useRouter();

  const form = useForm<QuestionAuthoringFormValues>({
    resolver: zodResolver(createQuestionAuthoringSchema(tValidation)),
    defaultValues: {
      courseId: "",
      learningObjectiveId: "",
      conceptId: "",
      soloLevelId: "",
      questionType: "mcq",
      prompt: "",
      feedback: "",
      aiGuidelines: "",
      isOptionShuffled: true,
      correctOptionId: "",
      options: initialOptions,
      rubric: "",
      idealAnswer: "",
    },
  });

  const [courseId, learningObjectiveId, conceptId, soloLevelId, questionType] =
    useWatch({
      control: form.control,
      name: [
        "courseId",
        "learningObjectiveId",
        "conceptId",
        "soloLevelId",
        "questionType",
      ],
    });

  const placement: QuestionPlacementValue = {
    courseId: courseId || undefined,
    learningObjectiveId: learningObjectiveId || undefined,
    conceptId: conceptId || undefined,
    soloLevelId: soloLevelId || undefined,
  };

  const createQuestion = useCreateAdminQuestion();

  function handlePlacementChange(nextPlacement: QuestionPlacementValue) {
    form.setValue("courseId", nextPlacement.courseId ?? "", {
      shouldValidate: true,
    });

    form.setValue(
      "learningObjectiveId",
      nextPlacement.learningObjectiveId ?? "",
      {
        shouldValidate: true,
      },
    );

    form.setValue("conceptId", nextPlacement.conceptId ?? "", {
      shouldValidate: true,
    });

    form.setValue("soloLevelId", nextPlacement.soloLevelId ?? "", {
      shouldValidate: true,
    });
  }

  async function onSubmit(values: QuestionAuthoringFormValues) {
    let request: CreateAdminQuestionRequest;

    if (values.questionType === "mcq") {
      request = {
        learning_objective_id: values.learningObjectiveId,
        concept_id: values.conceptId,
        solo_level_id: values.soloLevelId,

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
        learning_objective_id: values.learningObjectiveId,
        concept_id: values.conceptId,
        solo_level_id: values.soloLevelId,

        prompt: values.prompt.trim(),
        feedback: optionalText(values.feedback),
        ai_guidelines: optionalText(values.aiGuidelines),

        type: "essay",
        rubric: values.rubric.trim(),
        ideal_answer: values.idealAnswer.trim(),
      };
    }

    try {
      const createdQuestion = await createQuestion.mutateAsync(request);
      router.push(`/admin/questions/${createdQuestion.id}`);
    } catch {
      // Mutation state renders the API error.
    }
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/admin/questions" />}
      >
        <ArrowLeft />
        {tDetail("backToQuestions")}
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {tForm("createTitle")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {tForm("createDescription")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tPlacement("title")}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {tPlacement("description")}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <QuestionPlacementFields
            value={placement}
            onChange={handlePlacementChange}
            disabled={createQuestion.isPending}
          />

          {(form.formState.errors.courseId ||
            form.formState.errors.learningObjectiveId ||
            form.formState.errors.conceptId ||
            form.formState.errors.soloLevelId) && (
            <div className="space-y-1 text-sm text-destructive">
              {form.formState.errors.courseId && (
                <p>{form.formState.errors.courseId.message}</p>
              )}

              {form.formState.errors.learningObjectiveId && (
                <p>{form.formState.errors.learningObjectiveId.message}</p>
              )}

              {form.formState.errors.conceptId && (
                <p>{form.formState.errors.conceptId.message}</p>
              )}

              {form.formState.errors.soloLevelId && (
                <p>{form.formState.errors.soloLevelId.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tForm("typeTitle")}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm">
            <Select
              value={questionType}
              disabled={createQuestion.isPending}
              onValueChange={(value) => {
                if (value === "mcq" || value === "essay") {
                  form.setValue("questionType", value, {
                    shouldValidate: true,
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

          <p className="mt-3 text-sm text-muted-foreground">
            {questionType === "mcq"
              ? tForm("mcqDescription")
              : tForm("essayDescription")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tForm("contentTitle")}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {tForm("contentDescription")}
          </p>
        </CardHeader>

        <CardContent>
          <QuestionCommonFields
            control={form.control}
            register={form.register}
            errors={form.formState.errors}
            disabled={createQuestion.isPending}
          />
        </CardContent>
      </Card>

      {questionType === "mcq" && (
        <Card>
          <CardHeader>
            <CardTitle>{tForm("mcqTitle")}</CardTitle>

            <p className="text-sm text-muted-foreground">
              {tForm("mcqDescriptionSection")}
            </p>
          </CardHeader>

          <CardContent>
            <McqQuestionFields
              control={form.control}
              setValue={form.setValue}
              errors={form.formState.errors}
              disabled={createQuestion.isPending}
            />
          </CardContent>
        </Card>
      )}

      {questionType === "essay" && (
        <Card>
          <CardHeader>
            <CardTitle>{tForm("essayTitle")}</CardTitle>

            <p className="text-sm text-muted-foreground">
              {tForm("essayDescriptionSection")}
            </p>
          </CardHeader>

          <CardContent>
            <EssayQuestionFields
              control={form.control}
              errors={form.formState.errors}
              disabled={createQuestion.isPending}
            />
          </CardContent>
        </Card>
      )}

      {createQuestion.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createQuestion.error instanceof Error
              ? createQuestion.error.message
              : tErrors("createQuestion")}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          disabled={createQuestion.isPending}
          render={<Link href="/admin/questions" />}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={createQuestion.isPending}>
          {createQuestion.isPending && <Loader2 className="animate-spin" />}
          {createQuestion.isPending ? tForm("saving") : tForm("saveDraft")}
        </Button>
      </div>
    </form>
  );
}
