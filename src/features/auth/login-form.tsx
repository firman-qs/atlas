"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
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
import type { AuthMascotExpression } from "@/features/auth/components/auth-mascot";
import { useLogin } from "@/features/auth/queries";
import { ApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

function createLoginSchema(t: ReturnType<typeof useTranslations<"auth.validation">>) {
  return z.object({
    email: z.email(t("validEmail")),
    password: z
      .string()
      .min(1, t("passwordRequired"))
      .max(255, t("passwordTooLong")),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export interface LoginFormProps {
  className?: string;
  onExpressionChange?: (expression: AuthMascotExpression) => void;
}

export function LoginForm({ className, onExpressionChange }: LoginFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("auth.validation");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const loginSchema = useMemo(
    () => createLoginSchema(tValidation),
    [tValidation],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Calculate current mascot expression based on interaction state
  useEffect(() => {
    if (!onExpressionChange) return;

    if (loginMutation.isPending) {
      onExpressionChange("submitting");
    } else if (loginMutation.isError) {
      onExpressionChange("error");
    } else if (focusedField === "email") {
      onExpressionChange("looking_email");
    } else if (focusedField === "password") {
      onExpressionChange(showPassword ? "peeking_password" : "shy_password");
    } else {
      onExpressionChange("idle");
    }
  }, [focusedField, showPassword, loginMutation.isPending, loginMutation.isError, onExpressionChange]);

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
        ? t("fallbackError")
        : null;

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Email Field with Leading Icon */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("email")}
            </Label>

            <div className="relative flex items-center">
              <Mail
                className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground transition-colors"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                disabled={loginMutation.isPending}
                className="pl-10 h-11 bg-background/60 transition-colors focus-visible:bg-background"
                {...form.register("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {form.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field with Leading Icon & Show/Hide Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </Label>

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline sm:text-sm"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <div className="relative flex items-center">
              <Lock
                className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground transition-colors"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={loginMutation.isPending}
                className="pl-10 pr-10 h-11 bg-background/60 transition-colors focus-visible:bg-background"
                {...form.register("password")}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loginMutation.isPending}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {form.formState.errors.password && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive animate-in fade-in-50"
            >
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 font-medium shadow-md transition-all hover:shadow-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loginMutation.isPending ? t("submitting") : t("submit")}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
