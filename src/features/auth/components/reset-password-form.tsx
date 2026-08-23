"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(255, "Password is too long."),

    passwordConfirmation: z
      .string()
      .min(1, "Password confirmation is required."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Password confirmation does not match.",
    path: ["passwordConfirmation"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword();

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
          : "Unable to reset your password.",
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Set a new password</CardTitle>

        <CardDescription>
          Enter a new password for your ATLAS account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>

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
            <Label htmlFor="confirm-new-password">Confirm new password</Label>

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
              ? "Resetting password..."
              : "Reset password"}
          </Button>
        </form>

        {successMessage && (
          <Button
            nativeButton={false}
            variant="link"
            className="w-full"
            render={<Link href="/login" />}
          >
            Back to sign in
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
