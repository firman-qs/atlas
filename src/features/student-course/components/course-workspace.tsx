"use client";

import { ArrowLeft, BookOpen, Bot, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentOptionsPanel } from "@/features/student-course/components/assessment-options";

import { buttonVariants } from "@/components/ui/button";
import { LearningProgress } from "@/features/student-course/components/learning-progress";
import {
  useAssessmentOptions,
  useCreateLearningRecord,
  useLearningRecordProgress,
  useStudentEnrollment,
} from "@/features/student-course/queries";
import { cn } from "@/lib/utils";

interface CourseWorkspaceProps {
  enrollmentId: string;
}

function formatSemester(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface ActiveLearningWorkspaceProps {
  enrollmentId: string;
  learningRecordId: string;
  startedAt: string;
}

function ActiveLearningWorkspace({
  enrollmentId,
  learningRecordId,
  startedAt,
}: ActiveLearningWorkspaceProps) {
  const progressQuery = useLearningRecordProgress(learningRecordId);

  const assessmentOptionsQuery = useAssessmentOptions(learningRecordId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning workspace</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="font-medium">Learning record active</p>

          <p className="text-sm text-muted-foreground">
            Started {new Date(startedAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5" />
            AI Tutor
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Ask questions about this course and get guidance grounded in the
            curriculum and your current learning progress.
          </p>

          <Link
            href={`/student/courses/${enrollmentId}/chat`}
            className={buttonVariants()}
          >
            <Bot />
            Open AI Tutor
          </Link>
        </CardContent>
      </Card>

      {progressQuery.isPending ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>

          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ) : progressQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {progressQuery.error instanceof Error
              ? progressQuery.error.message
              : "Unable to load learning progress."}
          </AlertDescription>
        </Alert>
      ) : (
        <LearningProgress progress={progressQuery.data} />
      )}

      {assessmentOptionsQuery.isPending ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>

          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : assessmentOptionsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {assessmentOptionsQuery.error instanceof Error
              ? assessmentOptionsQuery.error.message
              : "Unable to load assessment options."}
          </AlertDescription>
        </Alert>
      ) : (
        <AssessmentOptionsPanel
          options={assessmentOptionsQuery.data}
          learningRecordId={learningRecordId}
        />
      )}
    </div>
  );
}

export function CourseWorkspace({ enrollmentId }: CourseWorkspaceProps) {
  const enrollmentQuery = useStudentEnrollment(enrollmentId);

  const createLearningRecord = useCreateLearningRecord(enrollmentId);

  if (enrollmentQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (enrollmentQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {enrollmentQuery.error instanceof Error
            ? enrollmentQuery.error.message
            : "Unable to load this course."}
        </AlertDescription>
      </Alert>
    );
  }

  const enrollment = enrollmentQuery.data;
  const offering = enrollment.course_offering;
  const course = offering.course;
  const learningRecord = enrollment.learning_record;

  return (
    <div className="space-y-6">
      <Link
        href="/student/courses"
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "-ml-3",
        )}
      >
        <ArrowLeft />
        My Courses
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {course.code}
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {course.title}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Section {offering.section} · {course.credits} credits
          </p>
        </div>

        <Badge variant={learningRecord ? "outline" : "secondary"}>
          {learningRecord ? "Learning started" : "Not started"}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {!learningRecord ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Learning workspace</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Start your learning record to begin tracking conceptual
                  progress and formative assessments for this course.
                </p>

                {createLearningRecord.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {createLearningRecord.error instanceof Error
                        ? createLearningRecord.error.message
                        : "Unable to start learning."}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => createLearningRecord.mutate()}
                  disabled={createLearningRecord.isPending}
                >
                  {createLearningRecord.isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <BookOpen />
                  )}

                  {createLearningRecord.isPending
                    ? "Starting..."
                    : "Start Learning"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="lg:col-span-2">
            <ActiveLearningWorkspace
              enrollmentId={enrollmentId}
              learningRecordId={learningRecord.id}
              startedAt={learningRecord.started_at}
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Course details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Instructor</p>
              <p className="font-medium">{offering.instructor.full_name}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Academic term</p>

              <p className="font-medium">
                {formatSemester(offering.academic_term.semester)}{" "}
                {offering.academic_term.year}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Enrollment</p>

              <p className="font-medium">
                {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
