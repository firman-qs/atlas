"use client";

import { ShieldCheck, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/features/auth/auth-provider";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import type { UserRole } from "@/features/auth/types";

const roleLabels: Record<UserRole, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator",
};

export default function AccountPage() {
  const { user, roles } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>

        <p className="mt-1 text-muted-foreground">
          Review your ATLAS identity and manage account security.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Profile
          </CardTitle>

          <CardDescription>
            Your authenticated ATLAS account information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Full name</dt>

              <dd className="mt-1 font-medium">{user.full_name}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>

              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Roles</dt>

              <dd className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="outline">
                    <ShieldCheck />
                    {roleLabels[role]}
                  </Badge>
                ))}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </div>
  );
}
