"use client";

import { ArrowLeft, BookOpen, Bot, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentOptionsPanel } from "@/features/student-course/components/assessment-options";
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
  learningRecordId: string;
}

function ActiveLearningWorkspace({
  learningRecordId,
}: ActiveLearningWorkspaceProps) {
  const progressQuery = useLearningRecordProgress(learningRecordId);
  const assessmentOptionsQuery = useAssessmentOptions(learningRecordId);

  return (
    <Tabs defaultValue="progress" className="min-w-0">
      <TabsList className="mb-4">
        <TabsTrigger value="progress">Learning Progress</TabsTrigger>

        <TabsTrigger value="assessments">
          Assessments
          {!assessmentOptionsQuery.isPending &&
            !assessmentOptionsQuery.isError &&
            assessmentOptionsQuery.data.active_assessment && (
              <Badge
                variant="secondary"
                className="h-4 min-w-4 rounded-full px-1 text-[10px]"
              >
                1
              </Badge>
            )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="progress">
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
      </TabsContent>

      <TabsContent value="assessments">
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
      </TabsContent>
    </Tabs>
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
        <div className="min-w-0">
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

        <Badge
          className="shrink-0"
          variant={learningRecord ? "outline" : "secondary"}
        >
          {learningRecord ? "Learning started" : "Not started"}
        </Badge>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <div className="min-w-0">
          {!learningRecord ? (
            <Card>
              <CardHeader>
                <CardTitle>Start learning</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="max-w-2xl text-muted-foreground">
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
              </CardContent>
            </Card>
          ) : (
            <ActiveLearningWorkspace learningRecordId={learningRecord.id} />
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <CardTitle>Course details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Instructor</p>
                <p className="mt-0.5 font-medium">
                  {offering.instructor.full_name}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Academic term</p>

                <p className="mt-0.5 font-medium">
                  {formatSemester(offering.academic_term.semester)}{" "}
                  {offering.academic_term.year}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Enrollment</p>

                <p className="mt-0.5 font-medium">
                  {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
              </div>

              {learningRecord && (
                <div>
                  <p className="text-muted-foreground">Started</p>

                  <p className="mt-0.5 font-medium">
                    {new Date(learningRecord.started_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {learningRecord && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="size-5" />
                  AI Tutor
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Ask questions about this course and get guidance grounded in
                  the curriculum and your current learning progress.
                </p>

                <Link
                  href={`/student/courses/${enrollmentId}/chat`}
                  className={cn(buttonVariants(), "w-full")}
                >
                  <Bot />
                  Open AI Tutor
                </Link>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
