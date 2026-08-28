"use client";

import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";
import Image from "next/image";
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
  formatDomainCode,
  semesterMessageKey,
} from "@/features/student-course/labels";
import {
  useAssessmentOptions,
  useCreateLearningRecord,
  useLearningRecordProgress,
  useStudentEnrollment,
} from "@/features/student-course/queries";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

interface CourseWorkspaceProps {
  enrollmentId: string;
}

interface ActiveLearningWorkspaceProps {
  learningRecordId: string;
}

function ActiveLearningWorkspace({
  learningRecordId,
}: ActiveLearningWorkspaceProps) {
  const course = useTranslations("course");
  const errors = useTranslations("errors");
  const progressQuery = useLearningRecordProgress(learningRecordId);
  const assessmentOptionsQuery = useAssessmentOptions(learningRecordId);

  return (
    <Tabs defaultValue="progress" className="min-w-0">
      <TabsList className="mb-4">
        <TabsTrigger value="progress">{course("learningProgress")}</TabsTrigger>

        <TabsTrigger value="assessments">
          {course("assessments")}
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
                : errors("learningProgress")}
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
                : errors("assessmentOptions")}
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
  const courseMessages = useTranslations("course");
  const student = useTranslations("student");
  const errors = useTranslations("errors");
  const format = useFormatter();
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
            : errors("course")}
        </AlertDescription>
      </Alert>
    );
  }

  const enrollment = enrollmentQuery.data;
  const offering = enrollment.course_offering;
  const course = offering.course;
  const learningRecord = enrollment.learning_record;
  const semesterKey = semesterMessageKey(offering.academic_term.semester);
  const semester = semesterKey
    ? courseMessages(`semesters.${semesterKey}`)
    : formatDomainCode(offering.academic_term.semester);

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
        {courseMessages("backToCourses")}
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
            {courseMessages("section", { section: offering.section })} ·{" "}
            {courseMessages("credits", { count: course.credits })}
          </p>
        </div>

        <Badge
          className="shrink-0"
          variant={learningRecord ? "outline" : "secondary"}
        >
          {learningRecord
            ? courseMessages("states.learningStarted")
            : courseMessages("states.notStarted")}
        </Badge>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <div className="min-w-0">
          {!learningRecord ? (
            <Card>
              <CardHeader>
                <CardTitle>{courseMessages("startLearning")}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="max-w-2xl text-muted-foreground">
                  {courseMessages("startLearningDescription")}
                </p>

                {createLearningRecord.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {createLearningRecord.error instanceof Error
                        ? createLearningRecord.error.message
                        : errors("startLearning")}
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
                    ? courseMessages("starting")
                    : courseMessages("startLearningAction")}
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
              <CardTitle>{courseMessages("courseDetails")}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {courseMessages("labels.instructor")}
                </p>
                <p className="mt-0.5 font-medium">
                  {offering.instructor.full_name}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  {courseMessages("labels.academicTerm")}
                </p>

                <p className="mt-0.5 font-medium">
                  {semester} {offering.academic_term.year}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  {courseMessages("labels.enrollment")}
                </p>

                <p className="mt-0.5 font-medium">
                  {format.dateTime(new Date(enrollment.enrolled_at), {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
                </p>
              </div>

              {learningRecord && (
                <div>
                  <p className="text-muted-foreground">
                    {courseMessages("labels.started")}
                  </p>

                  <p className="mt-0.5 font-medium">
                    {format.dateTime(new Date(learningRecord.started_at), {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {learningRecord && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="relative size-5 overflow-hidden">
                    <Image
                      src="/mascot.png"
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      className="size-full object-contain"
                    />
                  </div>
                  {student("aiTutor")}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {student("aiTutorDescription")}
                </p>

                <Link
                  href={`/student/courses/${enrollmentId}/chat`}
                  className={cn(buttonVariants(), "w-full gap-2")}
                >
                  <div className="relative size-4 overflow-hidden">
                    <Image
                      src="/mascot.png"
                      alt=""
                      aria-hidden="true"
                      width={16}
                      height={16}
                      className="size-full object-contain"
                    />
                  </div>
                  {student("openAiTutor")}
                </Link>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
