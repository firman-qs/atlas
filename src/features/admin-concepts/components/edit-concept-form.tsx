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
import type { AdminValidationTranslator } from "@/features/admin-validation";
import { useUpdateConcept } from "@/features/admin-concepts/queries";
import type { AdminConcept } from "@/features/admin-concepts/types";

export function editConceptSchema(t: AdminValidationTranslator) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t("conceptCodeRequired"))
      .max(50, t("conceptCodeMax")),

    name: z
      .string()
      .trim()
      .min(1, t("conceptNameRequired"))
      .max(255, t("conceptNameMax")),

    description: z.string().trim().min(1, t("conceptDescriptionRequired")),
  });
}

type EditConceptFormValues = z.infer<ReturnType<typeof editConceptSchema>>;

interface EditConceptFormProps {
  concept: AdminConcept;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditConceptForm({
  concept,
  onCancel,
  onSaved,
}: EditConceptFormProps) {
  const t = useTranslations("admin.concepts");
  const tValidation = useTranslations("admin.validation");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const updateConcept = useUpdateConcept(concept.course_id);

  const form = useForm<EditConceptFormValues>({
    resolver: zodResolver(editConceptSchema(tValidation)),
    defaultValues: {
      code: concept.code,
      name: concept.name,
      description: concept.description,
    },
  });

  async function onSubmit(values: EditConceptFormValues) {
    try {
      await updateConcept.mutateAsync({
        conceptId: concept.id,
        request: {
          code: values.code.trim(),
          name: values.name.trim(),
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
      {updateConcept.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateConcept.error instanceof Error
              ? updateConcept.error.message
              : tErrors("updateConcept")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`concept-code-${concept.id}`}>
            {t("labels.code")}
          </Label>

          <Input
            id={`concept-code-${concept.id}`}
            disabled={updateConcept.isPending}
            {...form.register("code")}
          />

          {form.formState.errors.code && (
            <p className="text-sm text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`concept-name-${concept.id}`}>
            {t("labels.name")}
          </Label>

          <Input
            id={`concept-name-${concept.id}`}
            disabled={updateConcept.isPending}
            {...form.register("name")}
          />

          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`concept-description-${concept.id}`}>
          {t("labels.description")}
        </Label>

        <Textarea
          id={`concept-description-${concept.id}`}
          rows={4}
          disabled={updateConcept.isPending}
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
          disabled={updateConcept.isPending}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={updateConcept.isPending}>
          {updateConcept.isPending && <Loader2 className="animate-spin" />}

          {updateConcept.isPending ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
