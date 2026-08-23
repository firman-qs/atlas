"use client";

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
            : "Unable to load course."}
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
        Courses
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <BookOpen className="size-5" />

                <Badge variant="outline">{course.code}</Badge>

                {course.is_active ? (
                  <Badge>Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}

                <Badge variant="secondary">
                  {course.credits} credit
                  {course.credits === 1 ? "" : "s"}
                </Badge>
              </div>

              <CardTitle className="text-2xl">{course.title}</CardTitle>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditing((current) => !current)}
            >
              <Pencil />
              {isEditing ? "Close editor" : "Edit course"}
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
                <p className="text-sm font-medium">Description</p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {course.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Course ID</p>

                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">
                  {course.id}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Credits</p>

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
