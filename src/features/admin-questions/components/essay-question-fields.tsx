"use client";

import { useTranslations } from "next-intl";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import { AtlasRichTextEditor } from "@/components/rich-text/atlas-rich-text-editor";
import { Label } from "@/components/ui/label";
import type { QuestionAuthoringFormValues } from "@/features/admin-questions/schemas";

interface EssayQuestionFieldsProps {
  control: Control<QuestionAuthoringFormValues>;
  errors: FieldErrors<QuestionAuthoringFormValues>;
  disabled?: boolean;
}

export function EssayQuestionFields({
  control,
  errors,
  disabled = false,
}: EssayQuestionFieldsProps) {
  const t = useTranslations("admin.questions.form");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("rubricLabel")}</Label>

        <Controller
          control={control}
          name="rubric"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              mediaPurpose="authoring"
              disabled={disabled}
              placeholder={t("rubricPlaceholder")}
              className="min-h-40"
            />
          )}
        />

        {errors.rubric && (
          <p className="text-sm text-destructive">{errors.rubric.message}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("rubricHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t("idealAnswerLabel")}</Label>

        <Controller
          control={control}
          name="idealAnswer"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              mediaPurpose="authoring"
              disabled={disabled}
              placeholder={t("idealAnswerPlaceholder")}
              className="min-h-48"
            />
          )}
        />

        {errors.idealAnswer && (
          <p className="text-sm text-destructive">
            {errors.idealAnswer.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("idealAnswerHelp")}
        </p>
      </div>
    </div>
  );
}
