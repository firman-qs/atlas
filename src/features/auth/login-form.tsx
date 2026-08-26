"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { z } from "zod";

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
import { useLogin } from "@/features/auth/queries";
import { ApiError } from "@/lib/api/api-error";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(255, "Password is too long."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values);
      router.replace("/dashboard");
    } catch {
      // Rendered below from mutation state.
    }
  }

  const errorMessage =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.isError
        ? "Unable to sign in. Please try again."
        : null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to ATLAS</CardTitle>
        <CardDescription>Use your ATLAS account to continue.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={loginMutation.isPending}
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password">Password</Label>

              <Link
                href="/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}

            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
