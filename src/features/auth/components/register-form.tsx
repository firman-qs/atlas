"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { useRegister } from "@/features/auth/queries";

function createRegisterSchema(
  t: ReturnType<typeof useTranslations<"auth.validation">>,
) {
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, t("fullNameRequired"))
        .max(255, t("fullNameTooLong")),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email(t("validEmail"))),

      password: z
        .string()
        .min(8, t("passwordMinLength", { min: 8 }))
        .max(255, t("passwordTooLong")),

      passwordConfirmation: z.string(),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
      message: t("passwordsDoNotMatch"),
      path: ["passwordConfirmation"],
    });
}

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const t = useTranslations("auth.register");
  const tValidation = useTranslations("auth.validation");
  const registerSchema = useMemo(
    () => createRegisterSchema(tValidation),
    [tValidation],
  );

  const [success, setSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSuccess(false);
    setSubmissionError(null);

    try {
      await registerMutation.mutateAsync({
        full_name: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      setSuccess(true);
      router.replace("/login");
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
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="full-name">{t("fullName")}</Label>

            <Input
              id="full-name"
              type="text"
              autoComplete="name"
              disabled={registerMutation.isPending}
              {...form.register("fullName")}
            />

            {form.formState.errors.fullName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={registerMutation.isPending}
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={registerMutation.isPending}
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-confirmation">{t("confirmPassword")}</Label>

            <Input
              id="password-confirmation"
              type="password"
              autoComplete="new-password"
              disabled={registerMutation.isPending}
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

          {success && (
            <Alert>
              <CheckCircle2 />
              <AlertDescription>
                {t("success")}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending && <Loader2 className="animate-spin" />}

            {registerMutation.isPending
              ? t("submitting")
              : t("submit")}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {t("hasAccount")} {" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
