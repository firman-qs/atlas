"use client";

import { Check, ChevronsUpDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
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

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

function getBreadcrumbs(
  pathname: string,
  t: ReturnType<typeof useTranslations<"navigation">>,
): BreadcrumbEntry[] {
  if (pathname === "/dashboard") {
    return [{ label: t("breadcrumbs.dashboard") }];
  }

  if (pathname === "/account") {
    return [{ label: t("breadcrumbs.account") }];
  }

  if (pathname.startsWith("/student/courses")) {
    if (pathname.includes("/chat")) {
      return [
        {
          label: t("breadcrumbs.myCourses"),
          href: "/student/courses",
        },
        {
          label: t("breadcrumbs.aiTutor"),
        },
      ];
    }

    return [{ label: t("breadcrumbs.myCourses") }];
  }

  if (pathname.startsWith("/student/assessments")) {
    return [{ label: t("breadcrumbs.assessments") }];
  }

  if (pathname.startsWith("/instructor/course-offerings")) {
    return [{ label: t("breadcrumbs.courseOfferings") }];
  }

  if (pathname.startsWith("/instructor/students")) {
    return [{ label: t("breadcrumbs.students") }];
  }

  if (pathname.startsWith("/admin/curriculum-import")) {
    return [{ label: t("breadcrumbs.curriculumImport") }];
  }

  if (pathname.startsWith("/admin/question-import")) {
    return [{ label: t("breadcrumbs.questionImport") }];
  }

  if (pathname.startsWith("/admin/question-banks")) {
    return [{ label: t("breadcrumbs.questionBanks") }];
  }

  if (pathname.startsWith("/admin/questions")) {
    return [{ label: t("breadcrumbs.questions") }];
  }

  if (pathname.startsWith("/admin/academic-terms")) {
    return [{ label: t("breadcrumbs.academicTerms") }];
  }

  if (pathname.startsWith("/admin/course-offerings")) {
    return [{ label: t("breadcrumbs.courseOfferings") }];
  }

  if (pathname.startsWith("/admin/courses")) {
    return [{ label: t("breadcrumbs.courses") }];
  }

  if (pathname.startsWith("/admin/users")) {
    return [{ label: t("breadcrumbs.users") }];
  }

  return [];
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("navigation.theme");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("toggle")}
            onClick={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          />
        }
      >
        <Sun className="hidden dark:block" />
        <Moon className="dark:hidden" />
      </TooltipTrigger>

      <TooltipContent side="bottom">{t("toggle")}</TooltipContent>
    </Tooltip>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const tNavigation = useTranslations("navigation");
  const tRoles = useTranslations("roles");

  const { user } = useAuth();
  const { activeRole, availableRoles, setActiveRole } = useActiveRole();

  const breadcrumbs = getBreadcrumbs(pathname, tNavigation);

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
              <span className="hidden sm:inline">{tRoles(activeRole)}</span>

              <span className="sm:hidden">
                {activeRole === "admin" ? tRoles("adminShort") : tRoles(activeRole)}
              </span>

              <ChevronsUpDown className="size-3.5 opacity-60" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{tNavigation("workspace")}</DropdownMenuLabel>

                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      router.push("/dashboard");
                    }}
                  >
                    <span className="flex-1">{tRoles(role)}</span>

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
