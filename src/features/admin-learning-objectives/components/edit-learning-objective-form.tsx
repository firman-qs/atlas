"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateLearningObjective } from "@/features/admin-learning-objectives/queries";
import type { AdminLearningObjective } from "@/features/admin-learning-objectives/types";

const editLearningObjectiveSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Learning objective code is required.")
    .max(50, "Learning objective code must be at most 50 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Learning objective description is required."),
});

type EditLearningObjectiveFormValues = z.infer<
  typeof editLearningObjectiveSchema
>;

interface EditLearningObjectiveFormProps {
  learningObjective: AdminLearningObjective;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditLearningObjectiveForm({
  learningObjective,
  onCancel,
  onSaved,
}: EditLearningObjectiveFormProps) {
  const updateLearningObjective = useUpdateLearningObjective();

  const form = useForm<EditLearningObjectiveFormValues>({
    resolver: zodResolver(editLearningObjectiveSchema),
    defaultValues: {
      code: learningObjective.code,
      description: learningObjective.description,
    },
  });

  async function onSubmit(values: EditLearningObjectiveFormValues) {
    try {
      await updateLearningObjective.mutateAsync({
        learningObjectiveId: learningObjective.id,
        request: {
          code: values.code.trim(),
          description: values.description.trim(),
        },
      });

      onSaved();
    } catch {
      // Mutation state renders the API error below.
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {updateLearningObjective.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateLearningObjective.error instanceof Error
              ? updateLearningObjective.error.message
              : "Unable to update learning objective."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor={`lo-code-${learningObjective.id}`}>Code</Label>

        <Input
          id={`lo-code-${learningObjective.id}`}
          disabled={updateLearningObjective.isPending}
          {...form.register("code")}
        />

        {form.formState.errors.code && (
          <p className="text-sm text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`lo-description-${learningObjective.id}`}>
          Description
        </Label>

        <Textarea
          id={`lo-description-${learningObjective.id}`}
          rows={4}
          disabled={updateLearningObjective.isPending}
          {...form.register("description")}
        />

        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateLearningObjective.isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={updateLearningObjective.isPending}>
          {updateLearningObjective.isPending && (
            <Loader2 className="animate-spin" />
          )}

          {updateLearningObjective.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
