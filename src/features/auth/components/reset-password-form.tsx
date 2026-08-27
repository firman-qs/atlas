"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
import { useResetPassword } from "@/features/auth/queries";

function createResetPasswordSchema(
  t: ReturnType<typeof useTranslations<"auth.validation">>,
) {
  return z
    .object({
      password: z
        .string()
        .min(8, t("passwordMinLength", { min: 8 }))
        .max(255, t("passwordTooLong")),

      passwordConfirmation: z
        .string()
        .min(1, t("passwordConfirmationRequired")),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
      message: t("passwordConfirmationDoesNotMatch"),
      path: ["passwordConfirmation"],
    });
}

type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword();
  const t = useTranslations("auth.resetPassword");
  const tValidation = useTranslations("auth.validation");
  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(tValidation),
    [tValidation],
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setSuccessMessage(null);
    setSubmissionError(null);

    try {
      const message = await resetPassword.mutateAsync({
        token,
        password: values.password,
      });

      setSuccessMessage(message);
      form.reset();
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : t("fallbackError"),
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>

        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>

            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              disabled={resetPassword.isPending}
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
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
              disabled={resetPassword.isPending}
              {...form.register("passwordConfirmation")}
            />

            {form.formState.errors.passwordConfirmation && (
              <p className="text-sm text-destructive">
                {form.formState.errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          {submissionError && (
            <Alert variant="destructive">
              <AlertDescription>{submissionError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending && <Loader2 className="animate-spin" />}

            {resetPassword.isPending
              ? t("submitting")
              : t("submit")}
          </Button>
        </form>

        {successMessage && (
          <Button
            nativeButton={false}
            variant="link"
            className="w-full"
            render={<Link href="/login" />}
          >
            {t("backToSignIn")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
