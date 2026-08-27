"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useChangePassword } from "@/features/auth/queries";

function createChangePasswordSchema(
  t: ReturnType<typeof useTranslations<"auth.validation">>,
) {
  return z
    .object({
      current_password: z
        .string()
        .min(8, t("currentPasswordMinLength", { min: 8 }))
        .max(255, t("currentPasswordTooLong")),

      new_password: z
        .string()
        .min(8, t("newPasswordMinLength", { min: 8 }))
        .max(255, t("newPasswordTooLong")),

      confirm_password: z
        .string()
        .min(1, t("confirmNewPassword"))
        .max(255, t("passwordConfirmationTooLong")),
    })
    .refine((values) => values.new_password === values.confirm_password, {
      message: t("passwordsDoNotMatch"),
      path: ["confirm_password"],
    })
    .refine((values) => values.current_password !== values.new_password, {
      message: t("newPasswordMustDiffer"),
      path: ["new_password"],
    });
}

type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const t = useTranslations("auth.changePassword");
  const tValidation = useTranslations("auth.validation");
  const changePasswordSchema = useMemo(
    () => createChangePasswordSchema(tValidation),
    [tValidation],
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),

    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setSuccessMessage(null);

    try {
      const message = await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });

      setSuccessMessage(message);

      form.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch {
      // The mutation state renders the backend error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>

        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>

            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              disabled={changePassword.isPending}
              {...form.register("current_password")}
            />

            {form.formState.errors.current_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.current_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>

            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              disabled={changePassword.isPending}
              {...form.register("new_password")}
            />

            {form.formState.errors.new_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.new_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">
              {t("confirmNewPassword")}
            </Label>

            <Input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              disabled={changePassword.isPending}
              {...form.register("confirm_password")}
            />

            {form.formState.errors.confirm_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          {changePassword.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {changePassword.error instanceof Error
                  ? changePassword.error.message
                  : t("fallbackError")}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <KeyRound />
            )}

            {changePassword.isPending
              ? t("submitting")
              : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
