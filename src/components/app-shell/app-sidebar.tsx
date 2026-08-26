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

const navigation = {
  student: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
        {
          label: "My Courses",
          href: "/student/courses",
          icon: BookOpen,
        },
        {
          label: "Assessments",
          href: "/student/assessments",
          icon: ClipboardCheck,
        },
      ],
    },
  ],

  instructor: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
        {
          label: "Course Offerings",
          href: "/instructor/course-offerings",
          icon: GraduationCap,
        },
        {
          label: "Students",
          href: "/instructor/students",
          icon: Users,
        },
      ],
    },
  ],

  admin: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Curriculum",
      items: [
        {
          label: "Courses",
          href: "/admin/courses",
          icon: BookOpen,
        },
        {
          label: "Curriculum Import",
          href: "/admin/curriculum-import",
          icon: FileUp,
        },
        {
          label: "Questions",
          href: "/admin/questions",
          icon: ClipboardCheck,
        },
        {
          label: "Question Import",
          href: "/admin/question-import",
          icon: FileUp,
        },
        {
          label: "Question Banks",
          href: "/admin/question-banks",
          icon: Library,
        },
      ],
    },
    {
      label: "Delivery",
      items: [
        {
          label: "Academic Terms",
          href: "/admin/academic-terms",
          icon: CalendarDays,
        },
        {
          label: "Course Offerings",
          href: "/admin/course-offerings",
          icon: GraduationCap,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
        },
      ],
    },
  ],
} as const;

function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

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

  const { isMobile } = useSidebar();
  const { activeRole } = useActiveRole();
  const { user } = useAuth();
  const logout = useLogout();

  const groups = activeRole ? navigation[activeRole] : [];

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="ATLAS"
              className="hover:bg-transparent active:bg-transparent"
              render={<Link href="/" />}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-xs">
                A
              </div>

              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate font-semibold tracking-tight">
                  ATLAS
                </div>

                <div className="truncate text-xs text-muted-foreground">
                  Formative Assessment
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
                        className="data-active:bg-sidebar-accent/70"
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
                      tooltip={`${user.full_name} · Account`}
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
