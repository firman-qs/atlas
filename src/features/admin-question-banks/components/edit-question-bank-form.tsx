"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateQuestionBank } from "@/features/admin-question-banks/queries";
import type { QuestionBank } from "@/features/admin-question-banks/types";
import { ApiError } from "@/lib/api/api-error";

const editQuestionBankSchema = z.object({
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

type EditQuestionBankFormValues = z.infer<typeof editQuestionBankSchema>;

interface EditQuestionBankFormProps {
  bank: QuestionBank;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditQuestionBankForm({
  bank,
  onCancel,
  onSaved,
}: EditQuestionBankFormProps) {
  const updateQuestionBank = useUpdateQuestionBank(bank.id);

  const form = useForm<EditQuestionBankFormValues>({
    resolver: zodResolver(editQuestionBankSchema),
    defaultValues: {
      code: bank.code,
      name: bank.name,
      description: bank.description ?? "",
      is_student_selectable: bank.is_student_selectable,
    },
  });

  const isStudentSelectable = useWatch({
    control: form.control,
    name: "is_student_selectable",
  });

  async function onSubmit(values: EditQuestionBankFormValues) {
    try {
      await updateQuestionBank.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        description:
          values.description.trim() === "" ? null : values.description.trim(),
        is_student_selectable: values.is_student_selectable,
      });

      onSaved();
    } catch {
      // Mutation error rendered below.
    }
  }

  const errorMessage =
    updateQuestionBank.error instanceof ApiError
      ? updateQuestionBank.error.message
      : updateQuestionBank.isError
        ? "Unable to update question bank."
        : null;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="edit-bank-code">Code</FieldLabel>

          <Input
            id="edit-bank-code"
            disabled={updateQuestionBank.isPending}
            aria-invalid={!!form.formState.errors.code}
            {...form.register("code")}
          />

          <FieldError errors={[form.formState.errors.code]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="edit-bank-name">Name</FieldLabel>

          <Input
            id="edit-bank-name"
            disabled={updateQuestionBank.isPending}
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />

          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-bank-description">Description</FieldLabel>

          <Textarea
            id="edit-bank-description"
            disabled={updateQuestionBank.isPending}
            {...form.register("description")}
          />
        </Field>

        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="edit-student-selectable">
              Student selectable
            </FieldLabel>

            <FieldDescription>
              Allow students to select this question bank for supported
              assessments.
            </FieldDescription>
          </div>

          <Switch
            id="edit-student-selectable"
            checked={isStudentSelectable}
            onCheckedChange={(checked) =>
              form.setValue("is_student_selectable", checked, {
                shouldDirty: true,
              })
            }
            disabled={updateQuestionBank.isPending}
          />
        </Field>
      </FieldGroup>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateQuestionBank.isPending}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={updateQuestionBank.isPending || !form.formState.isDirty}
        >
          {updateQuestionBank.isPending && <Loader2 className="animate-spin" />}

          {updateQuestionBank.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
