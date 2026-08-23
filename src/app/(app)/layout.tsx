import { AppShell } from "@/components/app-shell/app-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
