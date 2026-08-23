"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/types";

interface ActiveRoleContextValue {
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  availableRoles: UserRole[];
}

const ActiveRoleContext = createContext<ActiveRoleContextValue | null>(null);

const STORAGE_KEY = "atlas_active_role";

interface ActiveRoleProviderProps {
  children: React.ReactNode;
}

function getInitialStoredRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "admin" || stored === "instructor" || stored === "student") {
    return stored;
  }

  return null;
}

export function ActiveRoleProvider({ children }: ActiveRoleProviderProps) {
  const { roles } = useAuth();

  const [preferredRole, setPreferredRole] = useState<UserRole | null>(
    getInitialStoredRole,
  );

  const activeRole =
    preferredRole && roles.includes(preferredRole)
      ? preferredRole
      : (roles[0] ?? null);

  const setActiveRole = useCallback(
    (role: UserRole) => {
      if (!roles.includes(role)) {
        return;
      }

      setPreferredRole(role);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, role);
      }
    },
    [roles],
  );

  const value = useMemo<ActiveRoleContextValue>(
    () => ({
      activeRole,
      setActiveRole,
      availableRoles: roles,
    }),
    [activeRole, roles, setActiveRole],
  );

  return (
    <ActiveRoleContext.Provider value={value}>
      {children}
    </ActiveRoleContext.Provider>
  );
}

export function useActiveRole() {
  const context = useContext(ActiveRoleContext);

  if (!context) {
    throw new Error("useActiveRole must be used within ActiveRoleProvider.");
  }

  return context;
}
