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
import { useCreateConcept } from "@/features/admin-concepts/queries";

export function createConceptSchema(t: AdminValidationTranslator) {
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

type CreateConceptFormValues = z.infer<ReturnType<typeof createConceptSchema>>;

interface CreateConceptFormProps {
  courseId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export function CreateConceptForm({
  courseId,
  onCancel,
  onCreated,
}: CreateConceptFormProps) {
  const t = useTranslations("admin.concepts");
  const tValidation = useTranslations("admin.validation");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const createConcept = useCreateConcept(courseId);

  const form = useForm<CreateConceptFormValues>({
    resolver: zodResolver(createConceptSchema(tValidation)),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateConceptFormValues) {
    try {
      await createConcept.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
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
      {createConcept.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createConcept.error instanceof Error
              ? createConcept.error.message
              : tErrors("createConcept")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="concept-code">{t("labels.code")}</Label>

          <Input
            id="concept-code"
            placeholder={t("placeholders.code")}
            disabled={createConcept.isPending}
            {...form.register("code")}
          />

          {form.formState.errors.code && (
            <p className="text-sm text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept-name">{t("labels.name")}</Label>

          <Input
            id="concept-name"
            placeholder={t("placeholders.name")}
            disabled={createConcept.isPending}
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
        <Label htmlFor="concept-description">{t("labels.description")}</Label>

        <Textarea
          id="concept-description"
          rows={4}
          placeholder={t("placeholders.description")}
          disabled={createConcept.isPending}
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
          disabled={createConcept.isPending}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={createConcept.isPending}>
          {createConcept.isPending && <Loader2 className="animate-spin" />}

          {createConcept.isPending
            ? t("actions.creating")
            : t("actions.create")}
        </Button>
      </div>
    </form>
  );
}
