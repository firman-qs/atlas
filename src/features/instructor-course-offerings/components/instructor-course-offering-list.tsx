"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorCourseOfferings } from "@/features/instructor-course-offerings/queries";

function CourseOfferingListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>

          <CardContent>
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatSemester(value: string) {
  if (value.length === 0) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function InstructorCourseOfferingList() {
  const offeringsQuery = useInstructorCourseOfferings({
    page: 1,
    pageSize: 20,
  });

  if (offeringsQuery.isPending) {
    return <CourseOfferingListSkeleton />;
  }

  if (offeringsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {offeringsQuery.error instanceof Error
            ? offeringsQuery.error.message
            : "Unable to load course offerings."}
        </AlertDescription>
      </Alert>
    );
  }

  const data = offeringsQuery.data;

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <GraduationCap className="size-5 text-muted-foreground" />
            </div>

            <p className="mt-4 font-medium">No course offerings assigned</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              You do not currently have any course offerings assigned to your
              instructor account.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Badge variant="outline">
          {data.total} offering{data.total === 1 ? "" : "s"}
        </Badge>
      </div>

      {data.items.map((offering) => (
        <Card key={offering.id}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{offering.course.code}</Badge>

                  <Badge variant="outline">Section {offering.section}</Badge>
                </div>

                <CardTitle>{offering.course.title}</CardTitle>
              </div>

              <Button
                nativeButton={false}
                variant="outline"
                render={
                  <Link
                    href={`/instructor/course-offerings/${offering.id}`}
                    aria-label={`Open ${offering.course.title}`}
                  />
                }
              >
                Open
                <ArrowRight />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />

                <span>
                  {offering.course.credits} credit
                  {offering.course.credits === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" />

                <span>
                  {formatSemester(offering.academic_term.semester)}{" "}
                  {offering.academic_term.year}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="size-4" />

                <span>Section {offering.section}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
