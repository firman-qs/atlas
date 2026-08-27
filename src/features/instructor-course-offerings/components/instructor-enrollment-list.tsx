"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Loader2, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteInstructorEnrollment,
  useInstructorCourseOfferingEnrollments,
} from "@/features/instructor-course-offerings/queries";

interface InstructorEnrollmentListProps {
  courseOfferingId: string;
}

interface SelectedEnrollment {
  id: string;
  studentName: string;
}

function EnrollmentListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
            <Skeleton className="mt-3 h-5 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InstructorEnrollmentList({
  courseOfferingId,
}: InstructorEnrollmentListProps) {
  const t = useTranslations("instructor.enrollment");
  const tErrors = useTranslations("instructor.errors");
  const common = useTranslations("common");

  const enrollmentsQuery = useInstructorCourseOfferingEnrollments(
    courseOfferingId,
    {
      page: 1,
      pageSize: 100,
    },
  );

  const deleteEnrollment = useDeleteInstructorEnrollment(courseOfferingId);

  const [selectedEnrollment, setSelectedEnrollment] =
    useState<SelectedEnrollment | null>(null);

  async function handleUnenroll() {
    if (!selectedEnrollment) {
      return;
    }

    try {
      await deleteEnrollment.mutateAsync(selectedEnrollment.id);
      setSelectedEnrollment(null);
    } catch {
      // Mutation state renders the backend error.
    }
  }

  if (enrollmentsQuery.isPending) {
    return <EnrollmentListSkeleton />;
  }

  if (enrollmentsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("enrolledStudents")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {enrollmentsQuery.error instanceof Error
                ? enrollmentsQuery.error.message
                : tErrors("loadEnrollments")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const enrollments = enrollmentsQuery.data?.items ?? [];
  const total = enrollmentsQuery.data?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t("enrolledStudents")}</CardTitle>

            <Badge variant="outline">
              {t("studentCount", { count: total })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {deleteEnrollment.isError && !selectedEnrollment && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {deleteEnrollment.error instanceof Error
                  ? deleteEnrollment.error.message
                  : tErrors("unenrollStudent")}
              </AlertDescription>
            </Alert>
          )}

          {enrollments.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Users className="size-4 text-muted-foreground" />
              </div>

              <p className="mt-3 font-medium">{t("noStudentsEnrolled")}</p>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("noStudentsEnrolledDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const learningRecord = enrollment.learning_record;

                const learningStateKey = !learningRecord
                  ? "notStarted"
                  : learningRecord.completed_at
                    ? "completed"
                    : "inProgress";

                return (
                  <div
                    key={enrollment.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {enrollment.student.full_name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {enrollment.student.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          learningStateKey === "completed"
                            ? "default"
                            : learningStateKey === "inProgress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {t(`states.${learningStateKey}`)}
                      </Badge>

                      {learningRecord && (
                        <Button
                          nativeButton={false}
                          size="sm"
                          variant="outline"
                          render={
                            <Link
                              href={`/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecord.id}`}
                              aria-label={t("viewRecord", { name: enrollment.student.full_name })}
                            />
                          }
                        >
                          {t("view")}
                          <ArrowRight />
                        </Button>
                      )}

                      {!learningRecord && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={t("unenrollAria", { name: enrollment.student.full_name })}
                          onClick={() =>
                            setSelectedEnrollment({
                              id: enrollment.id,
                              studentName: enrollment.student.full_name,
                            })
                          }
                          disabled={deleteEnrollment.isPending}
                        >
                          {deleteEnrollment.isPending &&
                          deleteEnrollment.variables === enrollment.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <UserMinus />
                          )}
                          {t("unenroll")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={selectedEnrollment !== null}
        onOpenChange={(open) => {
          if (!open && !deleteEnrollment.isPending) {
            setSelectedEnrollment(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>

            <AlertDialogDescription>
              {selectedEnrollment
                ? t("dialog.descriptionNamed", { name: selectedEnrollment.studentName })
                : t("dialog.descriptionDefault")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteEnrollment.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteEnrollment.error instanceof Error
                  ? deleteEnrollment.error.message
                  : tErrors("unenrollStudent")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEnrollment.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteEnrollment.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleUnenroll();
              }}
            >
              {deleteEnrollment.isPending && (
                <Loader2 className="animate-spin" />
              )}

              {deleteEnrollment.isPending
                ? t("dialog.unenrolling")
                : t("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
