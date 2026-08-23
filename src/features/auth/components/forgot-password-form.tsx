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
import { useForgotPassword } from "@/features/auth/queries";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSuccessMessage(null);

    try {
      const message = await forgotPassword.mutateAsync(values);

      setSuccessMessage(message);
    } catch {
      // Mutation state renders the backend error below.
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>

        <CardDescription>
          Enter your account email and we&apos;ll provide password reset
          instructions if the account is eligible.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form
          className="space-y-5"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={forgotPassword.isPending}
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {forgotPassword.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {forgotPassword.error instanceof Error
                  ? forgotPassword.error.message
                  : "Unable to request a password reset."}
              </AlertDescription>
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
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending && <Loader2 className="animate-spin" />}

            {forgotPassword.isPending
              ? "Sending..."
              : "Send reset instructions"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            nativeButton={false}
            variant="link"
            render={<Link href="/login" />}
          >
            Back to sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
