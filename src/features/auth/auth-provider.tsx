"use client";

import { createContext, useContext, useMemo } from "react";

import { useSession } from "@/features/auth/queries";
import type { Me, UserRole } from "@/features/auth/types";

interface AuthContextValue {
  session: Me | null;
  user: Me["user"] | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionQuery = useSession();

  const value = useMemo<AuthContextValue>(() => {
    const session = sessionQuery.data ?? null;
    const roles = session?.roles ?? [];

    return {
      session,
      user: session?.user ?? null,
      roles,
      isAuthenticated: session !== null,
      isLoading: sessionQuery.isPending,
      isAdmin: roles.includes("admin"),
      isInstructor: roles.includes("instructor"),
      isStudent: roles.includes("student"),
    };
  }, [sessionQuery.data, sessionQuery.isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
