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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminValidationTranslator } from "@/features/admin-validation";
import { useUpdateQuestionBank } from "@/features/admin-question-banks/queries";
import type { QuestionBank } from "@/features/admin-question-banks/types";
import { ApiError } from "@/lib/api/api-error";

export function editQuestionBankSchema(t: AdminValidationTranslator) {
  return z.object({
    code: z.string().trim().min(1, t("codeRequired")).max(50, t("codeMax")),

    name: z.string().trim().min(1, t("nameRequired")).max(255, t("nameMax")),

    description: z.string(),

    is_student_selectable: z.boolean(),
  });
}

type EditQuestionBankFormValues = z.infer<
  ReturnType<typeof editQuestionBankSchema>
>;

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
  const t = useTranslations("admin.questionBanks.form");
  const tValidation = useTranslations("admin.validation");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const updateQuestionBank = useUpdateQuestionBank(bank.id);

  const form = useForm<EditQuestionBankFormValues>({
    resolver: zodResolver(editQuestionBankSchema(tValidation)),
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
        ? tErrors("updateQuestionBank")
        : null;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="edit-bank-code">{t("code")}</FieldLabel>

          <Input
            id="edit-bank-code"
            disabled={updateQuestionBank.isPending}
            aria-invalid={!!form.formState.errors.code}
            {...form.register("code")}
          />

          <FieldError errors={[form.formState.errors.code]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="edit-bank-name">{t("name")}</FieldLabel>

          <Input
            id="edit-bank-name"
            disabled={updateQuestionBank.isPending}
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />

          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-bank-description">
            {t("formDescription")}
          </FieldLabel>

          <Textarea
            id="edit-bank-description"
            disabled={updateQuestionBank.isPending}
            {...form.register("description")}
          />
        </Field>

        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="edit-student-selectable">
              {t("studentSelectable")}
            </FieldLabel>

            <FieldDescription>
              {t("studentSelectableEditDescription")}
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
          {common("cancel")}
        </Button>

        <Button
          type="submit"
          disabled={updateQuestionBank.isPending || !form.formState.isDirty}
        >
          {updateQuestionBank.isPending && <Loader2 className="animate-spin" />}

          {updateQuestionBank.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
