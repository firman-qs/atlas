"use client";

import { Check, ChevronsUpDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  instructor: "Instructor",
  student: "Student",
};

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  if (pathname === "/dashboard") {
    return [{ label: "Dashboard" }];
  }

  if (pathname === "/account") {
    return [{ label: "Account" }];
  }

  if (pathname.startsWith("/student/courses")) {
    if (pathname.includes("/chat")) {
      return [
        {
          label: "My Courses",
          href: "/student/courses",
        },
        {
          label: "AI Tutor",
        },
      ];
    }

    return [{ label: "My Courses" }];
  }

  if (pathname.startsWith("/student/assessments")) {
    return [{ label: "Assessments" }];
  }

  if (pathname.startsWith("/instructor/course-offerings")) {
    return [{ label: "Course Offerings" }];
  }

  if (pathname.startsWith("/instructor/students")) {
    return [{ label: "Students" }];
  }

  if (pathname.startsWith("/admin/curriculum-import")) {
    return [{ label: "Curriculum Import" }];
  }

  if (pathname.startsWith("/admin/question-import")) {
    return [{ label: "Question Import" }];
  }

  if (pathname.startsWith("/admin/question-banks")) {
    return [{ label: "Question Banks" }];
  }

  if (pathname.startsWith("/admin/questions")) {
    return [{ label: "Questions" }];
  }

  if (pathname.startsWith("/admin/academic-terms")) {
    return [{ label: "Academic Terms" }];
  }

  if (pathname.startsWith("/admin/course-offerings")) {
    return [{ label: "Course Offerings" }];
  }

  if (pathname.startsWith("/admin/courses")) {
    return [{ label: "Courses" }];
  }

  if (pathname.startsWith("/admin/users")) {
    return [{ label: "Users" }];
  }

  return [];
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          />
        }
      >
        <Sun className="hidden dark:block" />
        <Moon className="dark:hidden" />
      </TooltipTrigger>

      <TooltipContent side="bottom">Toggle theme</TooltipContent>
    </Tooltip>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();
  const { activeRole, availableRoles, setActiveRole } = useActiveRole();

  const breadcrumbs = getBreadcrumbs(pathname);

  if (!user) {
    return null;
  }

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/65 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />

        {breadcrumbs.length > 0 && (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <div key={`${item.label}-${index}`} className="contents">
                    {index > 0 && <BreadcrumbSeparator />}

                    <BreadcrumbItem className="min-w-0">
                      {item.href && !isLast ? (
                        <BreadcrumbLink
                          render={<Link href={item.href} />}
                          className="truncate"
                        >
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="truncate">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <LanguageSwitcher compact />
        <ThemeToggle />

        {activeRole && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2 px-2.5" />
              }
            >
              <span className="hidden sm:inline">{roleLabels[activeRole]}</span>

              <span className="sm:hidden">
                {activeRole === "admin" ? "Admin" : roleLabels[activeRole]}
              </span>

              <ChevronsUpDown className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>

                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      router.push("/dashboard");
                    }}
                  >
                    <span className="flex-1">{roleLabels[role]}</span>

                    {role === activeRole && <Check />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
