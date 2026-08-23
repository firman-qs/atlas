import { RoleGuard } from "@/features/auth/components/role-guard";

export default function InstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGuard role="instructor">{children}</RoleGuard>;
}
