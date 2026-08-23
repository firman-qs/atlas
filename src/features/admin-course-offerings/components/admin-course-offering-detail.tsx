"use client";

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

interface AdminCourseOfferingDetailProps {
  courseOfferingId: string;
}

function formatSemester(semester: string) {
  return semester
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
            : "Unable to load course offering."}
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
          Course Offerings
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{offering.course.code}</Badge>

            <Badge variant="outline">Section {offering.section}</Badge>

            <Badge variant="outline">
              {formatSemester(offering.academic_term.semester)}{" "}
              {offering.academic_term.year}
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {offering.course.title}
            </h1>

            <p className="mt-1 text-muted-foreground">
              Managed course delivery configuration.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Offering</CardTitle>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="size-4" />
                  Course
                </dt>

                <dd className="mt-1 font-medium">
                  {offering.course.code} — {offering.course.title}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Academic term
                </dt>

                <dd className="mt-1 font-medium">
                  {formatSemester(offering.academic_term.semester)}{" "}
                  {offering.academic_term.year}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="size-4" />
                  Instructor
                </dt>

                <dd className="mt-1">
                  <p className="font-medium">{offering.instructor.full_name}</p>

                  <p className="text-sm text-muted-foreground">
                    {offering.instructor.email}
                  </p>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Section</dt>

                <dd className="mt-1 font-medium">Section {offering.section}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <EditCourseOfferingForm offering={offering} />

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Delete Course Offering</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Delete this course offering</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Deletion is only allowed when no students are enrolled.
              </p>
            </div>

            {deleteOffering.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {deleteOffering.error instanceof Error
                    ? deleteOffering.error.message
                    : "Unable to delete course offering."}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Delete course offering
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
            <AlertDialogTitle>Delete course offering?</AlertDialogTitle>

            <AlertDialogDescription>
              Delete {offering.course.code}, Section {offering.section},{" "}
              {formatSemester(offering.academic_term.semester)}{" "}
              {offering.academic_term.year}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteOffering.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteOffering.error instanceof Error
                  ? deleteOffering.error.message
                  : "Unable to delete course offering."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOffering.isPending}>
              Cancel
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

              {deleteOffering.isPending ? "Deleting..." : "Confirm delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
