"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { StudentDashboard } from "@/features/dashboard/components/student-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeRole } = useActiveRole();

  if (!activeRole) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {user?.full_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {activeRole === "student"
            ? "Continue your learning and formative assessment."
            : activeRole === "instructor"
              ? "Manage your teaching and student learning."
              : "Manage ATLAS curriculum, delivery, and administration."}
        </p>
      </div>

      {activeRole === "student" ? (
        <StudentDashboard />
      ) : (
        <Card>
          <CardContent className="py-10 text-muted-foreground">
            {activeRole === "instructor"
              ? "Instructor dashboard is being prepared."
              : "Administrator dashboard is being prepared."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
