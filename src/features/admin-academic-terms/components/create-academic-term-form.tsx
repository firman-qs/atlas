"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useCreateAdminAcademicTerm } from "@/features/admin-academic-terms/queries";
import {
  academicSemesterOptions,
  formatAcademicSemester,
  isAcademicSemester,
} from "@/features/admin-academic-terms/semester";
import type { AcademicSemester } from "@/features/admin-academic-terms/types";
import { ApiError } from "@/lib/api/api-error";
import type { AdminValidationTranslator } from "@/features/admin-validation";

export function createAcademicTermSchema(t: AdminValidationTranslator) {
  return z
    .object({
      year: z
        .number()
        .int(t("yearWhole"))
        .min(2000, t("yearMin"))
        .max(2200, t("yearMax")),

      semester: z.enum([
        "odd",
        "even",
        "ganjil",
        "genap",
        "antara",
        "spring",
        "fall",
        "summer",
      ]),

      starts_at: z.string().min(1, t("startDateRequired")),

      ends_at: z.string().min(1, t("endDateRequired")),
    })
    .refine((values) => values.starts_at <= values.ends_at, {
      message: t("endDateOrder"),
      path: ["ends_at"],
    });
}

type CreateAcademicTermFormValues = z.infer<
  ReturnType<typeof createAcademicTermSchema>
>;

interface CreateAcademicTermFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateAcademicTermForm({
  onCreated,
  onCancel,
}: CreateAcademicTermFormProps) {
  const t = useTranslations("admin.academicTerms");
  const tValidation = useTranslations("admin.validation");
  const tSemesters = useTranslations("course.semesters");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  function getSemesterLabel(semester: AcademicSemester) {
    if (isAcademicSemester(semester)) {
      return tSemesters(semester);
    }
    return formatAcademicSemester(semester);
  }

  const createAcademicTerm = useCreateAdminAcademicTerm();

  const form = useForm<CreateAcademicTermFormValues>({
    resolver: zodResolver(createAcademicTermSchema(tValidation)),
    defaultValues: {
      year: new Date().getFullYear(),
      semester: "ganjil",
      starts_at: "",
      ends_at: "",
    },
  });

  const selectedSemester = useWatch({
    control: form.control,
    name: "semester",
  });

  async function onSubmit(values: CreateAcademicTermFormValues) {
    try {
      await createAcademicTerm.mutateAsync({
        year: values.year,
        semester: values.semester,
        starts_at: values.starts_at,
        ends_at: values.ends_at,
      });

      form.reset({
        year: new Date().getFullYear(),
        semester: "ganjil",
        starts_at: "",
        ends_at: "",
      });

      onCreated?.();
    } catch {
      // Mutation state renders the API error below.
    }
  }

  const errorMessage =
    createAcademicTerm.error instanceof ApiError
      ? createAcademicTerm.error.message
      : createAcademicTerm.isError
        ? tErrors("createAcademicTerm")
        : null;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.year}>
          <FieldLabel htmlFor="academic-term-year">
            {t("labels.year")}
          </FieldLabel>

          <Input
            id="academic-term-year"
            type="number"
            min={2000}
            max={2200}
            disabled={createAcademicTerm.isPending}
            aria-invalid={!!form.formState.errors.year}
            {...form.register("year", {
              valueAsNumber: true,
            })}
          />

          <FieldError errors={[form.formState.errors.year]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.semester}>
          <FieldLabel>{t("labels.semester")}</FieldLabel>

          <Select
            value={selectedSemester}
            onValueChange={(value) => {
              if (isAcademicSemester(value)) {
                form.setValue("semester", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
            disabled={createAcademicTerm.isPending}
          >
            <SelectTrigger
              className="w-full"
              aria-label={t("semesterAria")}
              aria-invalid={!!form.formState.errors.semester}
            >
              <span>{getSemesterLabel(selectedSemester)}</span>
            </SelectTrigger>

            <SelectContent>
              {academicSemesterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getSemesterLabel(option.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError errors={[form.formState.errors.semester]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.starts_at}>
          <FieldLabel htmlFor="academic-term-start">
            {t("labels.startDate")}
          </FieldLabel>

          <Input
            id="academic-term-start"
            type="date"
            disabled={createAcademicTerm.isPending}
            aria-invalid={!!form.formState.errors.starts_at}
            {...form.register("starts_at")}
          />

          <FieldError errors={[form.formState.errors.starts_at]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.ends_at}>
          <FieldLabel htmlFor="academic-term-end">
            {t("labels.endDate")}
          </FieldLabel>

          <Input
            id="academic-term-end"
            type="date"
            disabled={createAcademicTerm.isPending}
            aria-invalid={!!form.formState.errors.ends_at}
            {...form.register("ends_at")}
          />

          <FieldError errors={[form.formState.errors.ends_at]} />
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
            disabled={createAcademicTerm.isPending}
            onClick={onCancel}
          >
            {common("cancel")}
          </Button>
        )}

        <Button type="submit" disabled={createAcademicTerm.isPending}>
          {createAcademicTerm.isPending && <Loader2 className="animate-spin" />}

          {createAcademicTerm.isPending
            ? t("actions.creating")
            : t("actions.create")}
        </Button>
      </div>
    </form>
  );
}
