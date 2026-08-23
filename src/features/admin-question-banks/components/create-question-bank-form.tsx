"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCourses } from "@/features/admin-courses/queries";
import { useCreateQuestionBank } from "@/features/admin-question-banks/queries";
import { ApiError } from "@/lib/api/api-error";

const createQuestionBankSchema = z.object({
  course_id: z.string().min(1, "Course is required."),

  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(50, "Code cannot exceed 50 characters."),

  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(255, "Name cannot exceed 255 characters."),

  description: z.string(),

  is_student_selectable: z.boolean(),
});

type CreateQuestionBankFormValues = z.infer<typeof createQuestionBankSchema>;

export function CreateQuestionBankForm() {
  const createQuestionBank = useCreateQuestionBank();

  const coursesQuery = useAdminCourses({
    page: 1,
    pageSize: 100,
    active: true,
  });

  const form = useForm<CreateQuestionBankFormValues>({
    resolver: zodResolver(createQuestionBankSchema),
    defaultValues: {
      course_id: "",
      code: "",
      name: "",
      description: "",
      is_student_selectable: false,
    },
  });

  async function onSubmit(values: CreateQuestionBankFormValues) {
    try {
      await createQuestionBank.mutateAsync({
        course_id: values.course_id,
        code: values.code.trim(),
        name: values.name.trim(),
        description:
          values.description.trim() === "" ? null : values.description.trim(),
        is_student_selectable: values.is_student_selectable,
      });

      form.reset();
    } catch {
      // Rendered from mutation state below.
    }
  }

  const errorMessage =
    createQuestionBank.error instanceof ApiError
      ? createQuestionBank.error.message
      : createQuestionBank.isError
        ? "Unable to create question bank."
        : null;

  const selectedCourseId = useWatch({
    control: form.control,
    name: "course_id",
  });

  const isStudentSelectable = useWatch({
    control: form.control,
    name: "is_student_selectable",
  });

  const selectedCourse =
    coursesQuery.data?.items.find((course) => course.id === selectedCourseId) ??
    null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Question Bank</CardTitle>

        <CardDescription>
          Create a reusable question pool for a course.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.course_id}>
              <FieldLabel>Course</FieldLabel>

              {coursesQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {coursesQuery.error instanceof Error
                      ? coursesQuery.error.message
                      : "Unable to load courses."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedCourseId}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue("course_id", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  disabled={
                    coursesQuery.isPending || createQuestionBank.isPending
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!form.formState.errors.course_id}
                  >
                    <span className="truncate">
                      {coursesQuery.isPending
                        ? "Loading courses..."
                        : selectedCourse
                          ? `${selectedCourse.code} — ${selectedCourse.title}`
                          : "Select a course"}
                    </span>
                  </SelectTrigger>

                  <SelectContent>
                    {coursesQuery.data?.items.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} — {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <FieldError errors={[form.formState.errors.course_id]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.code}>
              <FieldLabel htmlFor="question-bank-code">Code</FieldLabel>

              <Input
                id="question-bank-code"
                placeholder="conceptual-review"
                disabled={createQuestionBank.isPending}
                aria-invalid={!!form.formState.errors.code}
                {...form.register("code")}
              />

              <FieldDescription>
                Unique within the selected course. Maximum 50 characters.
              </FieldDescription>

              <FieldError errors={[form.formState.errors.code]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="question-bank-name">Name</FieldLabel>

              <Input
                id="question-bank-name"
                placeholder="Conceptual Review Bank"
                disabled={createQuestionBank.isPending}
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />

              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="question-bank-description">
                Description
              </FieldLabel>

              <Textarea
                id="question-bank-description"
                placeholder="Optional description of this question bank."
                disabled={createQuestionBank.isPending}
                {...form.register("description")}
              />
            </Field>

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel htmlFor="student-selectable">
                  Student selectable
                </FieldLabel>

                <FieldDescription>
                  Allow students to choose this bank when an assessment supports
                  question-bank selection.
                </FieldDescription>
              </div>

              <Switch
                id="student-selectable"
                checked={isStudentSelectable}
                onCheckedChange={(checked) =>
                  form.setValue("is_student_selectable", checked, {
                    shouldDirty: true,
                  })
                }
                disabled={createQuestionBank.isPending}
              />
            </Field>
          </FieldGroup>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={
              createQuestionBank.isPending ||
              coursesQuery.isPending ||
              coursesQuery.isError
            }
          >
            {createQuestionBank.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
            )}

            {createQuestionBank.isPending
              ? "Creating..."
              : "Create question bank"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
