"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { useRegister } from "@/features/auth/queries";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .max(255, "Full name is too long."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(255, "Password is too long."),

    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

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
          : "Unable to create account. Please try again.",
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create your ATLAS account</CardTitle>

        <CardDescription>
          Register as a student to access your courses and assessments.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>

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
            <Label htmlFor="email">Email</Label>

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
            <Label htmlFor="password">Password</Label>

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
            <Label htmlFor="password-confirmation">Confirm password</Label>

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
                Account created successfully. Redirecting to sign in.
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
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
