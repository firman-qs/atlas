"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConceptLibrary } from "@/features/admin-concepts/components/concept-library";
import { CourseLifecycleActions } from "@/features/admin-courses/components/course-lifecycle-actions";
import { EditCourseForm } from "@/features/admin-courses/components/edit-course-form";
import { useAdminCourse } from "@/features/admin-courses/queries";
import { LearningObjectiveManager } from "@/features/admin-learning-objectives/components/learning-objective-manager";

interface AdminCourseDetailProps {
  courseId: string;
}

function AdminCourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-72" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-64" />
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminCourseDetail({ courseId }: AdminCourseDetailProps) {
  const t = useTranslations("admin.courses");
  const tDetail = useTranslations("admin.courses.detail");
  const tErrors = useTranslations("admin.errors");

  const courseQuery = useAdminCourse(courseId);
  const [isEditing, setIsEditing] = useState(false);

  if (courseQuery.isPending) {
    return <AdminCourseDetailSkeleton />;
  }

  if (courseQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {courseQuery.error instanceof Error
            ? courseQuery.error.message
            : tErrors("loadCourse")}
        </AlertDescription>
      </Alert>
    );
  }

  const course = courseQuery.data;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/admin/courses" />}
      >
        <ArrowLeft />
        {tDetail("backToCourses")}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <BookOpen className="size-5" />

                <Badge variant="outline">{course.code}</Badge>

                {course.is_active ? (
                  <Badge>{t("active")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("inactive")}</Badge>
                )}

                <Badge variant="secondary">
                  {t("credits", { count: course.credits })}
                </Badge>
              </div>

              <CardTitle className="text-2xl">{course.title}</CardTitle>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditing((current) => !current)}
            >
              <Pencil />
              {isEditing ? tDetail("closeEditor") : tDetail("editCourse")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <EditCourseForm
              course={course}
              onCancel={() => setIsEditing(false)}
              onSaved={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div>
                <p className="text-sm font-medium">{tDetail("description")}</p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {course.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">{tDetail("courseId")}</p>

                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">
                  {course.id}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">{tDetail("credits")}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {course.credits}
                </p>
              </div>

              <CourseLifecycleActions course={course} />
            </>
          )}
        </CardContent>
      </Card>

      <ConceptLibrary courseId={course.id} />

      <LearningObjectiveManager courseId={course.id} />
    </div>
  );
}
