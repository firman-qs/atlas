"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";

const copy = {
  student: {
    title: "Student Workspace",
    description:
      "Your courses, learning progress, and formative assessments will appear here.",
  },
  instructor: {
    title: "Instructor Workspace",
    description:
      "Your course offerings, enrolled students, and learning evidence will appear here.",
  },
  admin: {
    title: "Administrator Workspace",
    description:
      "Curriculum, users, course delivery, questions, and system configuration will appear here.",
  },
} as const;

export default function HomePage() {
  const { user } = useAuth();
  const { activeRole } = useActiveRole();

  if (!activeRole) {
    return null;
  }

  const workspace = copy[activeRole];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>

        <h1 className="text-3xl font-semibold tracking-tight">
          {user?.full_name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{workspace.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">{workspace.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
