"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminValidationTranslator } from "@/features/admin-validation";
import { useCreateAdminCourse } from "@/features/admin-courses/queries";
import { ApiError } from "@/lib/api/api-error";

export function createCourseSchema(t: AdminValidationTranslator) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t("courseCodeRequired"))
      .max(50, t("courseCodeMax")),

    title: z
      .string()
      .trim()
      .min(1, t("courseTitleRequired"))
      .max(255, t("courseTitleMax")),

    description: z.string().trim().min(1, t("courseDescriptionRequired")),

    credits: z
      .number()
      .int(t("creditsWhole"))
      .min(1, t("creditsMin"))
      .max(10, t("creditsMax")),
  });
}

type CreateCourseFormValues = z.infer<ReturnType<typeof createCourseSchema>>;

interface CreateCourseFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateCourseForm({
  onCreated,
  onCancel,
}: CreateCourseFormProps) {
  const t = useTranslations("admin.courses.form");
  const tValidation = useTranslations("admin.validation");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const createCourse = useCreateAdminCourse();

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema(tValidation)),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      credits: 4,
    },
  });

  async function onSubmit(values: CreateCourseFormValues) {
    try {
      await createCourse.mutateAsync({
        code: values.code.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        credits: values.credits,
      });

      form.reset();
      onCreated?.();
    } catch {
      // Mutation error rendered below.
    }
  }

  const errorMessage =
    createCourse.error instanceof ApiError
      ? createCourse.error.message
      : createCourse.isError
        ? tErrors("createCourse")
        : null;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="course-code">{t("code")}</FieldLabel>

          <Input
            id="course-code"
            placeholder={t("codePlaceholder")}
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.code}
            {...form.register("code")}
          />

          <FieldError errors={[form.formState.errors.code]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.title}>
          <FieldLabel htmlFor="course-title">{t("title")}</FieldLabel>

          <Input
            id="course-title"
            placeholder={t("titlePlaceholder")}
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.title}
            {...form.register("title")}
          />

          <FieldError errors={[form.formState.errors.title]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="course-description">
            {t("description")}
          </FieldLabel>

          <Textarea
            id="course-description"
            placeholder={t("descriptionPlaceholder")}
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.description}
            {...form.register("description")}
          />

          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.credits}>
          <FieldLabel htmlFor="course-credits">{t("credits")}</FieldLabel>

          <Input
            id="course-credits"
            type="number"
            min={1}
            max={10}
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.credits}
            {...form.register("credits", {
              valueAsNumber: true,
            })}
          />

          <FieldError errors={[form.formState.errors.credits]} />
        </Field>
      </FieldGroup>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createCourse.isPending}
          >
            {common("cancel")}
          </Button>
        )}

        <Button type="submit" disabled={createCourse.isPending}>
          {createCourse.isPending && <Loader2 className="animate-spin" />}

          {createCourse.isPending ? t("creating") : t("create")}
        </Button>
      </div>
    </form>
  );
}
