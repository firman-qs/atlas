"use client";

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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Question prompt</Label>

        <Controller
          control={control}
          name="prompt"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              mediaPurpose="authoring"
              placeholder="Write the question prompt..."
              className="min-h-40"
            />
          )}
        />

        {errors.prompt && (
          <p className="text-sm text-destructive">{errors.prompt.message}</p>
        )}

        <p className="text-xs text-muted-foreground">
          Markdown is stored as the canonical question content format.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Feedback</Label>

        <Controller
          control={control}
          name="feedback"
          render={({ field }) => (
            <AtlasRichTextEditor
              value={field.value}
              mediaPurpose="authoring"
              onChange={field.onChange}
              disabled={disabled}
              placeholder="Optional feedback shown or generated around this question..."
              className="min-h-32"
            />
          )}
        />

        {errors.feedback && (
          <p className="text-sm text-destructive">{errors.feedback.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-ai-guidelines">AI guidelines</Label>

        <Textarea
          id="question-ai-guidelines"
          rows={5}
          disabled={disabled}
          placeholder="Optional instructions for AI evaluation or pedagogical feedback..."
          {...register("aiGuidelines")}
        />

        {errors.aiGuidelines && (
          <p className="text-sm text-destructive">
            {errors.aiGuidelines.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          These instructions are machine-facing and are not part of the
          student-visible question content.
        </p>
      </div>
    </div>
  );
}
