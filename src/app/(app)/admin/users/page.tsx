import { AdminUserList } from "@/features/admin-users/components/admin-user-list";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Users
        </h1>

        <p className="mt-1 text-muted-foreground">
          Manage ATLAS accounts, roles, and account lifecycle.
        </p>
      </div>

      <AdminUserList />
    </div>
  );
}
