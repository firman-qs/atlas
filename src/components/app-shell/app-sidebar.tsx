"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { useLogout } from "@/features/auth/queries";

function getNavigation(
  t: ReturnType<typeof useTranslations<"navigation.sidebar">>,
) {
  return {
    student: [
      {
        label: t("workspace"),
        items: [
          {
            label: t("dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: t("myCourses"),
            href: "/student/courses",
            icon: BookOpen,
          },
          {
            label: t("assessments"),
            href: "/student/assessments",
            icon: ClipboardCheck,
          },
        ],
      },
    ],

    instructor: [
      {
        label: t("workspace"),
        items: [
          {
            label: t("dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: t("courseOfferings"),
            href: "/instructor/course-offerings",
            icon: GraduationCap,
          },
          {
            label: t("students"),
            href: "/instructor/students",
            icon: Users,
          },
        ],
      },
    ],

    admin: [
      {
        label: t("workspace"),
        items: [
          {
            label: t("dashboard"),
            href: "/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        label: t("curriculum"),
        items: [
          {
            label: t("courses"),
            href: "/admin/courses",
            icon: BookOpen,
          },
          {
            label: t("curriculumImport"),
            href: "/admin/curriculum-import",
            icon: FileUp,
          },
          {
            label: t("questions"),
            href: "/admin/questions",
            icon: ClipboardCheck,
          },
          {
            label: t("questionImport"),
            href: "/admin/question-import",
            icon: FileUp,
          },
          {
            label: t("questionBanks"),
            href: "/admin/question-banks",
            icon: Library,
          },
        ],
      },
      {
        label: t("delivery"),
        items: [
          {
            label: t("academicTerms"),
            href: "/admin/academic-terms",
            icon: CalendarDays,
          },
          {
            label: t("courseOfferings"),
            href: "/admin/course-offerings",
            icon: GraduationCap,
          },
        ],
      },
      {
        label: t("administration"),
        items: [
          {
            label: t("users"),
            href: "/admin/users",
            icon: Users,
          },
        ],
      },
    ],
  } as const;
}

function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("navigation.sidebar");

  const { isMobile } = useSidebar();
  const { activeRole } = useActiveRole();
  const { user } = useAuth();
  const logout = useLogout();

  const groups = activeRole ? getNavigation(t)[activeRole] : [];

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="ATLAS"
              className="hover:bg-transparent active:bg-transparent"
              render={<Link href="/dashboard" />}
            >
              <div className="relative size-7 shrink-0 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt={t("logoAlt")}
                  width={28}
                  height={28}
                  className="size-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate font-semibold tracking-tight">
                  ATLAS
                </div>

                <div className="truncate text-xs text-muted-foreground">
                  {t("formativeAssessment")}
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-1">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavigationItemActive(pathname, item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className="data-active:bg-sidebar-accent/70 my-0.5"
                        render={<Link href={item.href} />}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu modal={!isMobile}>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      tooltip={t("accountTooltip", { name: user.full_name })}
                      className="data-open:bg-sidebar-accent"
                    />
                  }
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {initials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 text-left leading-tight">
                    <div className="truncate text-sm font-medium">
                      {user.full_name}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side={isMobile ? "top" : "right"}
                  align={isMobile ? "start" : "end"}
                  sideOffset={8}
                  className={isMobile ? "w-56 min-w-56" : "min-w-56"}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{t("accountMenu")}</DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      <UserRound />
                      {t("accountMenu")}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={logout.isPending}
                      onClick={handleLogout}
                    >
                      <LogOut />
                      {t("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
