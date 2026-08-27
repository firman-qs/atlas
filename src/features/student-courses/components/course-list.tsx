"use client";

import { BookOpen } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/features/student-courses/components/course-card";
import { useStudentCourses } from "@/features/student-courses/queries";
import { useTranslations } from "next-intl";

function CourseListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CourseList() {
  const course = useTranslations("course");
  const errors = useTranslations("errors");
  const coursesQuery = useStudentCourses({
    page: 1,
    pageSize: 20,
  });

  if (coursesQuery.isPending) {
    return <CourseListSkeleton />;
  }

  if (coursesQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {coursesQuery.error instanceof Error
            ? coursesQuery.error.message
            : errors("courses")}
        </AlertDescription>
      </Alert>
    );
  }

  const enrollments = coursesQuery.data.items;

  if (enrollments.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <BookOpen className="size-5 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">{course("noCourses")}</h2>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {course("noCoursesDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enrollments.map((enrollment) => (
          <CourseCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {course("enrollmentCount", {
          shown: enrollments.length,
          total: coursesQuery.data.total,
        })}
      </p>
    </div>
  );
}
