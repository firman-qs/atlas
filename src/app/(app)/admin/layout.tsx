import { RoleGuard } from "@/features/auth/components/role-guard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGuard role="admin">{children}</RoleGuard>;
}
