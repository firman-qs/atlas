"use client";

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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Rubric</Label>

        <Controller
          control={control}
          name="rubric"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              placeholder="Define the criteria the response must satisfy..."
              className="min-h-40"
            />
          )}
        />

        {errors.rubric && (
          <p className="text-sm text-destructive">{errors.rubric.message}</p>
        )}

        <p className="text-xs text-muted-foreground">
          The rubric guides AI evaluation of the student response.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Ideal answer</Label>

        <Controller
          control={control}
          name="idealAnswer"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              placeholder="Write a representative high-quality answer..."
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
          This serves as a reference answer during essay evaluation.
        </p>
      </div>
    </div>
  );
}
