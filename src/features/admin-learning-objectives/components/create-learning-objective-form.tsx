"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLearningObjective } from "@/features/admin-learning-objectives/queries";

const createLearningObjectiveSchema = z.object({
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

type CreateLearningObjectiveFormValues = z.infer<
  typeof createLearningObjectiveSchema
>;

interface CreateLearningObjectiveFormProps {
  courseId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export function CreateLearningObjectiveForm({
  courseId,
  onCancel,
  onCreated,
}: CreateLearningObjectiveFormProps) {
  const t = useTranslations("admin.learningObjectives");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const createLearningObjective = useCreateLearningObjective(courseId);

  const form = useForm<CreateLearningObjectiveFormValues>({
    resolver: zodResolver(createLearningObjectiveSchema),
    defaultValues: {
      code: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateLearningObjectiveFormValues) {
    try {
      await createLearningObjective.mutateAsync({
        code: values.code.trim(),
        description: values.description.trim(),
      });

      form.reset();
      onCreated();
    } catch {
      // Mutation state renders the API error below.
    }
  }

  return (
    <form
      className="space-y-5 rounded-lg border bg-muted/20 p-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {createLearningObjective.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createLearningObjective.error instanceof Error
              ? createLearningObjective.error.message
              : tErrors("createLearningObjective")}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="learning-objective-code">{t("labels.code")}</Label>

        <Input
          id="learning-objective-code"
          placeholder="e.g. lo3"
          disabled={createLearningObjective.isPending}
          {...form.register("code")}
        />

        {form.formState.errors.code && (
          <p className="text-sm text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="learning-objective-description">{t("labels.description")}</Label>

        <Textarea
          id="learning-objective-description"
          rows={4}
          placeholder="Describe what students should understand or be able to do."
          disabled={createLearningObjective.isPending}
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
          disabled={createLearningObjective.isPending}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={createLearningObjective.isPending}>
          {createLearningObjective.isPending && (
            <Loader2 className="animate-spin" />
          )}

          {createLearningObjective.isPending
            ? t("actions.creating")
            : t("actions.create")}
        </Button>
      </div>
    </form>
  );
}
