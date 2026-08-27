"use client";

import { useTranslations } from "next-intl";
import { Loader2, Minus, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useAssignAdminUserRole,
  useRemoveAdminUserRole,
} from "@/features/admin-users/queries";

import type {
  AdminUser,
  AdminUserRole,
} from "@/features/admin-users/types";

interface AdminUserRoleManagementProps {
  user: AdminUser;
}

const roles: AdminUserRole[] = [
  "student",
  "instructor",
  "admin",
];

export function AdminUserRoleManagement({
  user,
}: AdminUserRoleManagementProps) {
  const tRoles = useTranslations("admin.users.roles");
  const tRoleDesc = useTranslations("admin.users.roleDescriptions");
  const tDetail = useTranslations("admin.users.detail");
  const tRoleMgmt = useTranslations("admin.users.roleManagement");
  const tErrors = useTranslations("admin.errors");

  const assignRole = useAssignAdminUserRole(user.id);
  const removeRole = useRemoveAdminUserRole(user.id);

  function formatRole(role: AdminUserRole) {
    if (role === "admin") return tRoles("admin");
    if (role === "instructor") return tRoles("instructor");
    return tRoles("student");
  }

  function roleDescription(role: AdminUserRole) {
    if (role === "admin") return tRoleDesc("admin");
    if (role === "instructor") return tRoleDesc("instructor");
    return tRoleDesc("student");
  }

  const mutationError =
    assignRole.isError
      ? assignRole.error
      : removeRole.isError
        ? removeRole.error
        : null;

  const mutationPending =
    assignRole.isPending || removeRole.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tRoleMgmt("title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {mutationError && (
          <Alert variant="destructive">
            <AlertDescription>
              {mutationError instanceof Error
                ? mutationError.message
                : tErrors("updateUserRole")}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {roles.map((role) => {
            const assigned = user.roles.includes(role);

            const assigningThisRole =
              assignRole.isPending &&
              assignRole.variables === role;

            const removingThisRole =
              removeRole.isPending &&
              removeRole.variables === role;

            return (
              <div
                key={role}
                className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {formatRole(role)}
                    </p>

                    <Badge
                      variant={
                        assigned
                          ? "default"
                          : "outline"
                      }
                    >
                      {assigned
                        ? tDetail("assigned")
                        : tDetail("notAssigned")}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {roleDescription(role)}
                  </p>
                </div>

                {assigned ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={mutationPending}
                    aria-label={tRoleMgmt("removeRoleAria", { role: formatRole(role) })}
                    onClick={() => {
                      assignRole.reset();
                      removeRole.reset();
                      removeRole.mutate(role);
                    }}
                  >
                    {removingThisRole ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Minus />
                    )}

                    {tRoleMgmt("remove")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={mutationPending}
                    aria-label={tRoleMgmt("assignRoleAria", { role: formatRole(role) })}
                    onClick={() => {
                      assignRole.reset();
                      removeRole.reset();
                      assignRole.mutate(role);
                    }}
                  >
                    {assigningThisRole ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plus />
                    )}

                    {tRoleMgmt("assign")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
