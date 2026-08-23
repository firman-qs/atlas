"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
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

import { useChangePassword } from "@/features/auth/queries";

const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(8, "Current password must contain at least 8 characters.")
      .max(255, "Current password is too long."),

    new_password: z
      .string()
      .min(8, "New password must contain at least 8 characters.")
      .max(255, "New password is too long."),

    confirm_password: z
      .string()
      .min(1, "Confirm your new password.")
      .max(255, "Password confirmation is too long."),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine((values) => values.current_password !== values.new_password, {
    message: "New password must be different from the current password.",
    path: ["new_password"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const changePassword = useChangePassword();

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
        <CardTitle>Change Password</CardTitle>

        <CardDescription>
          Update the password used to sign in to your ATLAS account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>

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
            <Label htmlFor="new-password">New password</Label>

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
            <Label htmlFor="confirm-new-password">Confirm new password</Label>

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
                  : "Unable to change password."}
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
              ? "Changing password..."
              : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
