"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { ActiveRoleProvider } from "@/features/auth/active-role-provider";
import { AuthProvider } from "@/features/auth/auth-provider";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ActiveRoleProvider>{children}</ActiveRoleProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
