"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { ChevronRight, Search, Users } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminUsers } from "@/features/admin-users/queries";
import type { AdminUserRole } from "@/features/admin-users/types";

type ActiveFilter = "all" | "active" | "inactive";

function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-5 w-32" />
            </div>

            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminUserList() {
  const t = useTranslations("admin.users");
  const tFilters = useTranslations("admin.users.filters");
  const tStatuses = useTranslations("admin.users.statuses");
  const tRoles = useTranslations("admin.users.roles");
  const tErrors = useTranslations("admin.errors");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("all");

  const usersQuery = useAdminUsers({
    page: 1,
    pageSize: 50,
    search,
    isActive:
      activeFilter === "all"
        ? undefined
        : activeFilter === "active",
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function formatRole(role: AdminUserRole) {
    if (role === "admin") return tRoles("admin");
    if (role === "instructor") return tRoles("instructor");
    return tRoles("student");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tFilters("title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <form
              onSubmit={handleSearch}
              className="flex gap-2"
            >
              <Input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder={tFilters("searchPlaceholder")}
                aria-label={tFilters("searchAria")}
              />

              <Button type="submit" variant="outline">
                <Search />
                {tFilters("searchButton")}
              </Button>
            </form>

            <Select
              value={activeFilter}
              onValueChange={(value) =>
                setActiveFilter(value as ActiveFilter)
              }
            >
              <SelectTrigger aria-label={tFilters("statusAria")}>
                <SelectValue placeholder={tFilters("statusPlaceholder")} />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{tFilters("allAccounts")}</SelectItem>
                <SelectItem value="active">{tFilters("active")}</SelectItem>
                <SelectItem value="inactive">{tFilters("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {usersQuery.isPending ? (
        <UserListSkeleton />
      ) : usersQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {usersQuery.error instanceof Error
              ? usersQuery.error.message
              : tErrors("loadUsers")}
          </AlertDescription>
        </Alert>
      ) : usersQuery.data.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Users className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">{t("empty.title")}</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {usersQuery.data.items.map((user) => {
            const deleted = user.deleted_at !== null;

            return (
              <Card key={user.id}>
                <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 space-y-2">
                    <div>
                      <p className="font-medium">
                        {user.full_name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          user.is_active && !deleted
                            ? "default"
                            : "secondary"
                        }
                      >
                        {deleted
                          ? tStatuses("deleted")
                          : user.is_active
                            ? tStatuses("active")
                            : tStatuses("inactive")}
                      </Badge>

                      {user.roles.length === 0 ? (
                        <Badge variant="outline">{t("noRoles")}</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                          >
                            {formatRole(role)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/admin/users/${user.id}`}
                        aria-label={t("manageAria", { name: user.full_name })}
                      />
                    }
                  >
                    {t("manage")}
                    <ChevronRight />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <p className="text-sm text-muted-foreground">
            {t("showingCount", {
              count: usersQuery.data.items.length,
              total: usersQuery.data.total,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
