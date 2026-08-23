import { AdminUserDetail } from "@/features/admin-users/components/admin-user-detail";

interface AdminUserDetailPageProps {
  params: Promise<{
    user_id: string;
  }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { user_id } = await params;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminUserDetail userId={user_id} />
    </div>
  );
}
