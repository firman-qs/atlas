"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  Users,
} from "lucide-react";

import Link from "next/link";

import { useActiveRole } from "@/features/auth/active-role-provider";
import { cn } from "@/lib/utils";

const navigation = {
  student: [
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

  instructor: [
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

  admin: [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Curriculum Import",
      href: "/admin/curriculum-import",
      icon: BookOpen,
    },
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
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "System",
      href: "/admin/system",
      icon: Settings,
    },
  ],
} as const;

export function AppSidebar() {
  const { activeRole } = useActiveRole();

  const items = activeRole ? navigation[activeRole] : [];

  return (
    <aside className="hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ATLAS
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                "text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
