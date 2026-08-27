"use client";

import { useTranslations } from "next-intl";
import { AdminUserList } from "@/features/admin-users/components/admin-user-list";

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <AdminUserList />
    </div>
  );
}
