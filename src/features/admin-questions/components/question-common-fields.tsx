"use client";

import { useTranslations } from "next-intl";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import { AtlasRichTextEditor } from "@/components/rich-text/atlas-rich-text-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionAuthoringFormValues } from "@/features/admin-questions/schemas";

interface QuestionCommonFieldsProps {
  control: Control<QuestionAuthoringFormValues>;
  register: UseFormRegister<QuestionAuthoringFormValues>;
  errors: FieldErrors<QuestionAuthoringFormValues>;
  disabled?: boolean;
}

export function QuestionCommonFields({
  control,
  register,
  errors,
  disabled = false,
}: QuestionCommonFieldsProps) {
  const t = useTranslations("admin.questions.form");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("promptLabel")}</Label>

        <Controller
          control={control}
          name="prompt"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              mediaPurpose="authoring"
              placeholder={t("promptPlaceholder")}
              className="min-h-40"
            />
          )}
        />

        {errors.prompt && (
          <p className="text-sm text-destructive">{errors.prompt.message}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("promptHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t("feedbackLabel")}</Label>

        <Controller
          control={control}
          name="feedback"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              mediaPurpose="authoring"
              onChange={field.onChange}
              disabled={disabled}
              placeholder={t("feedbackPlaceholder")}
              className="min-h-32"
            />
          )}
        />

        {errors.feedback && (
          <p className="text-sm text-destructive">{errors.feedback.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-ai-guidelines">{t("aiGuidelinesLabel")}</Label>

        <Textarea
          id="question-ai-guidelines"
          rows={5}
          disabled={disabled}
          placeholder={t("aiGuidelinesPlaceholder")}
          {...register("aiGuidelines")}
        />

        {errors.aiGuidelines && (
          <p className="text-sm text-destructive">
            {errors.aiGuidelines.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("aiGuidelinesHelp")}
        </p>
      </div>
    </div>
  );
}
