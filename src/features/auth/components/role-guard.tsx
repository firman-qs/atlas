"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/types";

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();

  const { roles, isLoading } = useAuth();
  const { activeRole, setActiveRole } = useActiveRole();

  const hasRole = roles.includes(role);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasRole) {
      router.replace("/dashboard");
      return;
    }

    if (activeRole !== role) {
      setActiveRole(role);
    }
  }, [activeRole, hasRole, isLoading, role, router, setActiveRole]);

  if (isLoading || !hasRole || activeRole !== role) {
    return null;
  }

  return children;
}
