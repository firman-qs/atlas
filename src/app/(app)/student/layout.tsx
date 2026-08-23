import { RoleGuard } from "@/features/auth/components/role-guard";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGuard role="student">{children}</RoleGuard>;
}
