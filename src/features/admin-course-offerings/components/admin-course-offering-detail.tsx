"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { EditCourseOfferingForm } from "@/features/admin-course-offerings/components/edit-course-offering-form";
import {
  useAdminCourseOffering,
  useDeleteAdminCourseOffering,
} from "@/features/admin-course-offerings/queries";
import { formatAcademicSemester } from "@/features/admin-academic-terms/semester";

interface AdminCourseOfferingDetailProps {
  courseOfferingId: string;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function AdminCourseOfferingDetail({
  courseOfferingId,
}: AdminCourseOfferingDetailProps) {
  const t = useTranslations("admin.courseOfferings");
  const tDetail = useTranslations("admin.courseOfferings.detail");
  const tSemesters = useTranslations("course.semesters");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  function getSemesterLabel(semester: string) {
    return tSemesters.has(semester as any) ? tSemesters(semester as any) : formatAcademicSemester(semester);
  }

  const router = useRouter();

  const offeringQuery = useAdminCourseOffering(courseOfferingId);
  const deleteOffering = useDeleteAdminCourseOffering(courseOfferingId);

  const [deleteOpen, setDeleteOpen] = useState(false);

  if (offeringQuery.isPending) {
    return <DetailSkeleton />;
  }

  if (offeringQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {offeringQuery.error instanceof Error
            ? offeringQuery.error.message
            : tErrors("loadCourseOffering")}
        </AlertDescription>
      </Alert>
    );
  }

  const offering = offeringQuery.data;

  async function handleDelete() {
    try {
      await deleteOffering.mutateAsync();

      router.push("/admin/course-offerings");
    } catch {
      // Mutation state renders the backend error.
    }
  }

  const formattedSemester = getSemesterLabel(offering.academic_term.semester);

  return (
    <>
      <div className="space-y-6">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href="/admin/course-offerings" />}
        >
          <ArrowLeft />
          {tDetail("backToOfferings")}
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{offering.course.code}</Badge>

            <Badge variant="outline">{t("section", { section: offering.section })}</Badge>

            <Badge variant="outline">
              {formattedSemester}{" "}
              {offering.academic_term.year}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {offering.course.title}
            </h1>

            <p className="mt-1 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{tDetail("labels.course")}</CardTitle>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="size-4" />
                  {tDetail("labels.course")}
                </dt>

                <dd className="mt-1 font-medium">
                  {offering.course.code} — {offering.course.title}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {tDetail("labels.academicTerm")}
                </dt>

                <dd className="mt-1 font-medium">
                  {formattedSemester}{" "}
                  {offering.academic_term.year}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="size-4" />
                  {tDetail("labels.instructor")}
                </dt>

                <dd className="mt-1">
                  <p className="font-medium">{offering.instructor.full_name}</p>

                  <p className="text-sm text-muted-foreground">
                    {offering.instructor.email}
                  </p>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">{tDetail("labels.section")}</dt>

                <dd className="mt-1 font-medium">{t("section", { section: offering.section })}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <EditCourseOfferingForm offering={offering} />

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>{tDetail("deleteOffering")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{tDetail("deleteOffering")}</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {tDetail("dialog.description", {
                  courseTitle: offering.course.title,
                  section: offering.section,
                  semester: formattedSemester,
                  year: offering.academic_term.year,
                  instructorName: offering.instructor.full_name,
                })}
              </p>
            </div>

            {deleteOffering.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {deleteOffering.error instanceof Error
                    ? deleteOffering.error.message
                    : tErrors("deleteCourseOffering")}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              {tDetail("deleteOffering")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteOffering.isPending) {
            setDeleteOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDetail("dialog.title")}</AlertDialogTitle>

            <AlertDialogDescription>
              {tDetail("dialog.description", {
                courseTitle: offering.course.title,
                section: offering.section,
                semester: formattedSemester,
                year: offering.academic_term.year,
                instructorName: offering.instructor.full_name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteOffering.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteOffering.error instanceof Error
                  ? deleteOffering.error.message
                  : tErrors("deleteCourseOffering")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOffering.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteOffering.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleteOffering.isPending && <Loader2 className="animate-spin" />}

              {deleteOffering.isPending ? tDetail("dialog.deleting") : tDetail("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
