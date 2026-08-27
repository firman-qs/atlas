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
import { useUpdateAdminCourse } from "@/features/admin-courses/queries";
import type { AdminCourse } from "@/features/admin-courses/types";

const editCourseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Course code is required.")
    .max(50, "Course code must be at most 50 characters."),
  title: z
    .string()
    .trim()
    .min(1, "Course title is required.")
    .max(255, "Course title must be at most 255 characters."),
  description: z.string().trim().min(1, "Course description is required."),
  credits: z
    .number()
    .int("Credits must be a whole number.")
    .min(1, "Credits must be at least 1.")
    .max(10, "Credits must be at most 10."),
});

type EditCourseFormValues = z.infer<typeof editCourseSchema>;

interface EditCourseFormProps {
  course: AdminCourse;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditCourseForm({
  course,
  onCancel,
  onSaved,
}: EditCourseFormProps) {
  const t = useTranslations("admin.courses.form");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const updateCourse = useUpdateAdminCourse(course.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      code: course.code,
      title: course.title,
      description: course.description,
      credits: course.credits,
    },
  });

  async function onSubmit(values: EditCourseFormValues) {
    try {
      await updateCourse.mutateAsync({
        code: values.code.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        credits: values.credits,
      });

      onSaved();
    } catch {
      // Mutation state renders the API error below.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {updateCourse.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateCourse.error instanceof Error
              ? updateCourse.error.message
              : tErrors("updateCourse")}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-course-code">{t("code")}</Label>
        <Input
          id="edit-course-code"
          {...register("code")}
          disabled={updateCourse.isPending}
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-course-title">{t("title")}</Label>
        <Input
          id="edit-course-title"
          {...register("title")}
          disabled={updateCourse.isPending}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-course-description">{t("description")}</Label>
        <Textarea
          id="edit-course-description"
          {...register("description")}
          disabled={updateCourse.isPending}
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-course-credits">{t("credits")}</Label>
        <Input
          id="edit-course-credits"
          type="number"
          min={1}
          max={10}
          step={1}
          {...register("credits", { valueAsNumber: true })}
          disabled={updateCourse.isPending}
        />
        {errors.credits && (
          <p className="text-sm text-destructive">{errors.credits.message}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateCourse.isPending}
        >
          {common("cancel")}
        </Button>

        <Button type="submit" disabled={updateCourse.isPending}>
          {updateCourse.isPending && <Loader2 className="animate-spin" />}
          {updateCourse.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
