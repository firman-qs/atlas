"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

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
export default function AccountPage() {
  const { user, roles } = useAuth();
  const t = useTranslations("account");
  const tRoles = useTranslations("roles");

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

        <p className="mt-1 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            {t("profile")}
          </CardTitle>

          <CardDescription>
            {t("profileDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("fullName")}</dt>

              <dd className="mt-1 font-medium">{user.full_name}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">{t("email")}</dt>

              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">{t("roles")}</dt>

              <dd className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="outline">
                    <ShieldCheck />
                    {tRoles(role)}
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
