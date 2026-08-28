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
import { useUpdateAdminAcademicTerm } from "@/features/admin-academic-terms/queries";
import {
  academicSemesterOptions,
  formatAcademicSemester,
  isAcademicSemester,
} from "@/features/admin-academic-terms/semester";
import type {
  AcademicSemester,
  AdminAcademicTerm,
} from "@/features/admin-academic-terms/types";
import type { AdminValidationTranslator } from "@/features/admin-validation";

export function editAcademicTermSchema(t: AdminValidationTranslator) {
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

type EditAcademicTermFormValues = z.infer<
  ReturnType<typeof editAcademicTermSchema>
>;

interface EditAcademicTermFormProps {
  academicTerm: AdminAcademicTerm;
  onSaved: () => void;
  onCancel: () => void;
}

export function EditAcademicTermForm({
  academicTerm,
  onSaved,
  onCancel,
}: EditAcademicTermFormProps) {
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

  const updateAcademicTerm = useUpdateAdminAcademicTerm(academicTerm.id);

  const form = useForm<EditAcademicTermFormValues>({
    resolver: zodResolver(editAcademicTermSchema(tValidation)),
    defaultValues: {
      year: academicTerm.year,
      semester: academicTerm.semester,
      starts_at: academicTerm.starts_at,
      ends_at: academicTerm.ends_at,
    },
  });

  const selectedSemester = useWatch({
    control: form.control,
    name: "semester",
  });

  async function onSubmit(values: EditAcademicTermFormValues) {
    try {
      await updateAcademicTerm.mutateAsync({
        year: values.year,
        semester: values.semester,
        starts_at: values.starts_at,
        ends_at: values.ends_at,
      });

      onSaved();
    } catch {
      // Mutation state renders the backend error below.
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {updateAcademicTerm.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateAcademicTerm.error instanceof Error
              ? updateAcademicTerm.error.message
              : tErrors("updateAcademicTerm")}
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.year}>
          <FieldLabel htmlFor="edit-academic-term-year">
            {t("labels.year")}
          </FieldLabel>

          <Input
            id="edit-academic-term-year"
            type="number"
            min={2000}
            max={2200}
            disabled={updateAcademicTerm.isPending}
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
            disabled={updateAcademicTerm.isPending}
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
          <FieldLabel htmlFor="edit-academic-term-start">
            {t("labels.startDate")}
          </FieldLabel>

          <Input
            id="edit-academic-term-start"
            type="date"
            disabled={updateAcademicTerm.isPending}
            aria-invalid={!!form.formState.errors.starts_at}
            {...form.register("starts_at")}
          />

          <FieldError errors={[form.formState.errors.starts_at]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.ends_at}>
          <FieldLabel htmlFor="edit-academic-term-end">
            {t("labels.endDate")}
          </FieldLabel>

          <Input
            id="edit-academic-term-end"
            type="date"
            disabled={updateAcademicTerm.isPending}
            aria-invalid={!!form.formState.errors.ends_at}
            {...form.register("ends_at")}
          />

          <FieldError errors={[form.formState.errors.ends_at]} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={updateAcademicTerm.isPending}
          onClick={onCancel}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={updateAcademicTerm.isPending}>
          {updateAcademicTerm.isPending && <Loader2 className="animate-spin" />}

          {updateAcademicTerm.isPending
            ? t("actions.saving")
            : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
