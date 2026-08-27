"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useActiveRole } from "@/features/auth/active-role-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { StudentDashboard } from "@/features/dashboard/components/student-dashboard";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const messages = useTranslations("dashboard");
  const { user } = useAuth();
  const { activeRole } = useActiveRole();

  if (!activeRole) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {messages("welcomeBack")}
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {user?.full_name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {activeRole === "student"
            ? messages("roleDescription.student")
            : activeRole === "instructor"
              ? messages("roleDescription.instructor")
              : messages("roleDescription.admin")}
        </p>
      </div>

      {activeRole === "student" ? (
        <StudentDashboard />
      ) : (
        <Card>
          <CardContent className="py-10 text-muted-foreground">
            {activeRole === "instructor"
              ? messages("rolePending.instructor")
              : messages("rolePending.admin")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
