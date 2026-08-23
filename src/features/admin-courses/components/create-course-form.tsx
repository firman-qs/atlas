"use client";

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
import { useCreateAdminCourse } from "@/features/admin-courses/queries";
import { ApiError } from "@/lib/api/api-error";

const createCourseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Course code is required.")
    .max(50, "Course code cannot exceed 50 characters."),

  title: z
    .string()
    .trim()
    .min(1, "Course title is required.")
    .max(255, "Course title cannot exceed 255 characters."),

  description: z.string().trim().min(1, "Course description is required."),

  credits: z
    .number()
    .int("Credits must be a whole number.")
    .min(1, "Credits must be at least 1.")
    .max(10, "Credits cannot exceed 10."),
});

type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

interface CreateCourseFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function CreateCourseForm({
  onCreated,
  onCancel,
}: CreateCourseFormProps) {
  const createCourse = useCreateAdminCourse();

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
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
        ? "Unable to create course."
        : null;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="course-code">Code</FieldLabel>

          <Input
            id="course-code"
            placeholder="e.g. um032em000"
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.code}
            {...form.register("code")}
          />

          <FieldError errors={[form.formState.errors.code]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.title}>
          <FieldLabel htmlFor="course-title">Title</FieldLabel>

          <Input
            id="course-title"
            placeholder="e.g. Electromagnetics"
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.title}
            {...form.register("title")}
          />

          <FieldError errors={[form.formState.errors.title]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.description}>
          <FieldLabel htmlFor="course-description">Description</FieldLabel>

          <Textarea
            id="course-description"
            placeholder="Describe the course."
            disabled={createCourse.isPending}
            aria-invalid={!!form.formState.errors.description}
            {...form.register("description")}
          />

          <FieldError errors={[form.formState.errors.description]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.credits}>
          <FieldLabel htmlFor="course-credits">Credits</FieldLabel>

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
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={createCourse.isPending}>
          {createCourse.isPending && <Loader2 className="animate-spin" />}

          {createCourse.isPending ? "Creating..." : "Create course"}
        </Button>
      </div>
    </form>
  );
}
