"use client";

import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { AdminUserDelete } from "@/features/admin-users/components/admin-user-delete";
import { AdminUserRoleManagement } from "@/features/admin-users/components/admin-user-role-management";
import { useAdminUser } from "@/features/admin-users/queries";
import type { AdminUserRole } from "@/features/admin-users/types";

interface AdminUserDetailProps {
  userId: string;
}

function formatRole(role: AdminUserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function AdminUserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}

export function AdminUserDetail({ userId }: AdminUserDetailProps) {
  const userQuery = useAdminUser(userId);

  if (userQuery.isPending) {
    return <AdminUserDetailSkeleton />;
  }

  if (userQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {userQuery.error instanceof Error
            ? userQuery.error.message
            : "Unable to load user."}
        </AlertDescription>
      </Alert>
    );
  }

  const user = userQuery.data;
  const deleted = user.deleted_at !== null;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={<Link href="/admin/users" />}
      >
        <ArrowLeft />
        Users
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={user.is_active && !deleted ? "default" : "secondary"}>
            {deleted ? "Deleted" : user.is_active ? "Active" : "Inactive"}
          </Badge>

          {user.roles.length === 0 ? (
            <Badge variant="outline">No roles</Badge>
          ) : (
            user.roles.map((role) => (
              <Badge key={role} variant="outline">
                {formatRole(role)}
              </Badge>
            ))
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.full_name}
          </h1>

          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Full name</dt>

              <dd className="mt-1 font-medium">{user.full_name}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>

              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Account status</dt>

              <dd className="mt-1 font-medium">
                {deleted ? "Deleted" : user.is_active ? "Active" : "Inactive"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">User ID</dt>

              <dd className="mt-1 break-all font-mono text-sm">{user.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>

        <CardContent>
          {user.roles.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <UserRound className="size-6 text-muted-foreground" />

              <p className="mt-3 font-medium">No roles assigned</p>

              <p className="mt-1 text-sm text-muted-foreground">
                This account currently has no ATLAS application roles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.roles.map((role) => (
                <div
                  key={role}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="font-medium">{formatRole(role)}</p>

                      <p className="text-sm text-muted-foreground">
                        {role === "admin"
                          ? "Administrative access to ATLAS management features."
                          : role === "instructor"
                            ? "Instructor access to owned course offerings and student learning evidence."
                            : "Student access to enrolled courses and formative assessments."}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline">Assigned</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!deleted && (
        <>
          <AdminUserRoleManagement user={user} />
          <AdminUserDelete userId={user.id} userName={user.full_name} />
        </>
      )}
    </div>
  );
}
