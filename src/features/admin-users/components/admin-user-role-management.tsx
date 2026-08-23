"use client";

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

function formatRole(role: AdminUserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function roleDescription(role: AdminUserRole) {
  switch (role) {
    case "admin":
      return "Administrative access to ATLAS management features.";

    case "instructor":
      return "Instructor access to owned course offerings and student learning evidence.";

    case "student":
      return "Student access to enrolled courses and formative assessments.";
  }
}

export function AdminUserRoleManagement({
  user,
}: AdminUserRoleManagementProps) {
  const assignRole = useAssignAdminUserRole(user.id);
  const removeRole = useRemoveAdminUserRole(user.id);

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
        <CardTitle>Role Management</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {mutationError && (
          <Alert variant="destructive">
            <AlertDescription>
              {mutationError instanceof Error
                ? mutationError.message
                : "Unable to update user role."}
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
                        ? "Assigned"
                        : "Not assigned"}
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
                    aria-label={`Remove ${role} role`}
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

                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={mutationPending}
                    aria-label={`Assign ${role} role`}
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

                    Assign
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
