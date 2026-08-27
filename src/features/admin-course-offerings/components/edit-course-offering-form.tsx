"use client";

import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateAdminCourseOffering } from "@/features/admin-course-offerings/queries";
import type { AdminCourseOffering } from "@/features/admin-course-offerings/types";
import { useAdminUsers } from "@/features/admin-users/queries";

interface EditCourseOfferingFormProps {
  offering: AdminCourseOffering;
}

export function EditCourseOfferingForm({
  offering,
}: EditCourseOfferingFormProps) {
  const t = useTranslations("admin.courseOfferings.form");
  const tDetail = useTranslations("admin.courseOfferings.detail");
  const tErrors = useTranslations("admin.errors");

  const usersQuery = useAdminUsers({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const updateOffering = useUpdateAdminCourseOffering(offering.id);

  const [instructorId, setInstructorId] = useState(offering.instructor.id);
  const [section, setSection] = useState(offering.section);

  const instructors = useMemo(() => {
    const available = (usersQuery.data?.items ?? []).filter(
      (user) =>
        user.is_active &&
        user.deleted_at === null &&
        user.roles.includes("instructor"),
    );

    return available;
  }, [usersQuery.data]);

  const normalizedSection = section.trim();

  const changed =
    instructorId !== offering.instructor.id ||
    normalizedSection !== offering.section;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!changed || normalizedSection === "") {
      return;
    }

    const request: {
      instructor_id?: string;
      section?: string;
    } = {};

    if (instructorId !== offering.instructor.id) {
      request.instructor_id = instructorId;
    }

    if (normalizedSection !== offering.section) {
      request.section = normalizedSection;
    }

    try {
      await updateOffering.mutateAsync(request);
    } catch {
      // Mutation state renders the backend error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tDetail("editOffering")}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-course-offering-instructor">
                {t("instructor")}
              </Label>

              <select
                id="edit-course-offering-instructor"
                value={instructorId}
                onChange={(event) => setInstructorId(event.target.value)}
                disabled={usersQuery.isPending || updateOffering.isPending}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!instructors.some(
                  (instructor) => instructor.id === offering.instructor.id,
                ) && (
                  <option value={offering.instructor.id}>
                    {offering.instructor.full_name} —{" "}
                    {offering.instructor.email}
                  </option>
                )}

                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.full_name} — {instructor.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-course-offering-section">{t("section")}</Label>

              <Input
                id="edit-course-offering-section"
                value={section}
                onChange={(event) => setSection(event.target.value)}
                disabled={updateOffering.isPending}
              />
            </div>
          </div>

          {usersQuery.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : tErrors("loadUsers")}
              </AlertDescription>
            </Alert>
          )}

          {updateOffering.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {updateOffering.error instanceof Error
                  ? updateOffering.error.message
                  : tErrors("updateCourseOffering")}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                usersQuery.isPending ||
                updateOffering.isPending ||
                normalizedSection === "" ||
                !changed
              }
            >
              {updateOffering.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save />
              )}

              {updateOffering.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
