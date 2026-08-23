"use client";

import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCourseOfferingForm } from "@/features/admin-course-offerings/components/create-course-offering-form";
import { useAdminCourseOfferings } from "@/features/admin-course-offerings/queries";

function formatSemester(semester: string) {
  return semester
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CourseOfferingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function AdminCourseOfferingManager() {
  const offeringsQuery = useAdminCourseOfferings({
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Course Offerings
        </h1>

        <p className="mt-1 text-muted-foreground">
          Configure course delivery by academic term, section, and instructor.
        </p>
      </div>

      <CreateCourseOfferingForm />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Configured Course Offerings</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Existing course deliveries available in ATLAS.
              </p>
            </div>

            {!offeringsQuery.isPending && !offeringsQuery.isError && (
              <Badge variant="outline">
                {offeringsQuery.data?.total ?? 0} offering
                {(offeringsQuery.data?.total ?? 0) === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {offeringsQuery.isPending ? (
            <CourseOfferingListSkeleton />
          ) : offeringsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {offeringsQuery.error instanceof Error
                  ? offeringsQuery.error.message
                  : "Unable to load course offerings."}
              </AlertDescription>
            </Alert>
          ) : offeringsQuery.data.items.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="size-4 text-muted-foreground" />
              </div>

              <p className="mt-3 font-medium">No course offerings configured</p>

              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create a course offering to assign an active course to an
                instructor for an academic term.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offeringsQuery.data.items.map((offering) => (
                <div
                  key={offering.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{offering.course.code}</Badge>

                      <Badge variant="outline">
                        Section {offering.section}
                      </Badge>

                      <Badge variant="outline">
                        {formatSemester(offering.academic_term.semester)}{" "}
                        {offering.academic_term.year}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium">{offering.course.title}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {offering.instructor.full_name}
                        {" · "}
                        {offering.instructor.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={
                      <Link href={`/admin/course-offerings/${offering.id}`} />
                    }
                  >
                    Manage
                    <ArrowRight />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
