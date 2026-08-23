"use client";

import { Check, ChevronsUpDown, LogOut, Menu, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { useLogout } from "@/features/auth/queries";
import type { UserRole } from "@/features/auth/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  instructor: "Instructor",
  student: "Student",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppHeader() {
  const router = useRouter();

  const { user } = useAuth();
  const { activeRole, availableRoles, setActiveRole } = useActiveRole();

  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        {activeRole && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="gap-2" />}
            >
              {roleLabels[activeRole]}
              <ChevronsUpDown className="size-4 opacity-60" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>

                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      router.push("/");
                    }}
                  >
                    <span className="flex-1">{roleLabels[role]}</span>

                    {role === activeRole && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="h-auto gap-3 px-2" />}
        >
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium">{user.full_name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>

          <Avatar>
            <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => router.push("/account")}>
              <UserRound />
              My Account
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={logout.isPending}
              onClick={handleLogout}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
