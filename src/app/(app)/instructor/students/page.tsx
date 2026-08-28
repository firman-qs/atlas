"use client";

import { useTranslations } from "next-intl";

import { InstructorStudentList } from "@/features/instructor-students/components/instructor-student-list";

export default function InstructorStudentsPage() {
  const t = useTranslations("instructor.students");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

        <p className="mt-1 text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <InstructorStudentList />
    </div>
  );
}
