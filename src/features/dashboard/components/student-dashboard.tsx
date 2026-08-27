"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDomainCode,
  semesterMessageKey,
} from "@/features/student-course/labels";
import { useLearningRecordProgress } from "@/features/student-course/queries";
import { useStudentCourses } from "@/features/student-courses/queries";
import type {
  StudentEnrollment,
  StudentLearningRecordSummary,
} from "@/features/student-courses/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

function coursePriority(enrollment: StudentEnrollment) {
  if (enrollment.learning_record?.active_assessment) {
    return 0;
  }

  if (enrollment.learning_record && !enrollment.learning_record.completed_at) {
    return 1;
  }

  if (!enrollment.learning_record) {
    return 2;
  }

  return 3;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>

      <Skeleton className="h-52 rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

interface DashboardMetricProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function DashboardMetric({ icon, label, value }: DashboardMetricProps) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 px-5 py-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm leading-5 text-muted-foreground">{label}</p>

        <p className="mt-0.5 text-2xl font-semibold leading-7 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

interface ContinueLearningCardProps {
  enrollment: StudentEnrollment;
  learningRecord: StudentLearningRecordSummary;
}

function ContinueLearningCard({
  enrollment,
  learningRecord,
}: ContinueLearningCardProps) {
  const dashboard = useTranslations("dashboard");
  const student = useTranslations("student");
  const courseMessages = useTranslations("course");
  const assessmentMessages = useTranslations("assessment");
  const progressQuery = useLearningRecordProgress(learningRecord.id);

  const offering = enrollment.course_offering;
  const course = offering.course;
  const activeAssessment = learningRecord.active_assessment;
  const semesterKey = semesterMessageKey(offering.academic_term.semester);
  const semester = semesterKey
    ? courseMessages(`semesters.${semesterKey}`)
    : formatDomainCode(offering.academic_term.semester);

  const learningObjectives = progressQuery.data?.learning_objectives ?? [];

  const masteredLearningObjectives = learningObjectives.filter(
    (learningObjective) => learningObjective.mastered_at !== null,
  ).length;

  const concepts = learningObjectives.flatMap(
    (learningObjective) => learningObjective.concepts,
  );

  const masteredConcepts = concepts.filter(
    (concept) => concept.mastered_at !== null,
  ).length;

  const learningObjectivePercent =
    learningObjectives.length === 0
      ? 0
      : (masteredLearningObjectives / learningObjectives.length) * 100;

  const conceptPercent =
    concepts.length === 0 ? 0 : (masteredConcepts / concepts.length) * 100;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {course.code}
                </p>

                {activeAssessment && (
                  <Badge>{courseMessages("assessmentInProgress")}</Badge>
                )}
              </div>

              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                {course.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {courseMessages("courseSummary", {
                  section: offering.section,
                  semester,
                  year: offering.academic_term.year,
                  credits: courseMessages("credits", { count: course.credits }),
                })}
                {" · "}
                {offering.instructor.full_name}
              </p>

              {activeAssessment && (
                <p className="mt-3 text-sm font-medium">
                  {assessmentMessages(`modeAssessment.${activeAssessment.mode}`)}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {activeAssessment ? (
                <Link
                  href={`/student/assessments/${activeAssessment.id}`}
                  className={cn(buttonVariants())}
                >
                  <ClipboardCheck />
                  {courseMessages("continueAssessment")}
                  <ArrowRight />
                </Link>
              ) : (
                <Link
                  href={`/student/courses/${enrollment.id}`}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                  )}
                >
                  <BookOpen />
                  {courseMessages("openCourse")}
                  <ArrowRight />
                </Link>
              )}

              <Link
                href={`/student/courses/${enrollment.id}/chat`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                )}
              >
                <Bot />
                {student("aiTutor")}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/20 p-5 sm:p-6">
          <p className="text-sm font-medium">{dashboard("courseProgress")}</p>

          {progressQuery.isPending ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : progressQuery.isError ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {dashboard("progressUnavailable")}
            </p>
          ) : (
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    {courseMessages("progress.learningObjectives")}
                  </span>

                  <span className="text-sm font-medium">
                    {courseMessages("progress.masteredCount", {
                      mastered: masteredLearningObjectives,
                      total: learningObjectives.length,
                    })}
                  </span>
                </div>

                <Progress value={learningObjectivePercent} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    {courseMessages("progress.concepts")}
                  </span>

                  <span className="text-sm font-medium">
                    {courseMessages("progress.masteredCount", {
                      mastered: masteredConcepts,
                      total: concepts.length,
                    })}
                  </span>
                </div>

                <Progress value={conceptPercent} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentDashboard() {
  const dashboard = useTranslations("dashboard");
  const student = useTranslations("student");
  const assessmentMessages = useTranslations("assessment");
  const errors = useTranslations("errors");
  const coursesQuery = useStudentCourses({
    page: 1,
    pageSize: 100,
  });

  if (coursesQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (coursesQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {coursesQuery.error instanceof Error
            ? coursesQuery.error.message
            : errors("dashboard")}
        </AlertDescription>
      </Alert>
    );
  }

  const data = coursesQuery.data;
  const enrollments = data.items;

  const startedCount = enrollments.filter(
    (enrollment) => enrollment.learning_record !== null,
  ).length;

  const activeAssessmentCount = enrollments.filter(
    (enrollment) =>
      enrollment.learning_record?.active_assessment !== null &&
      enrollment.learning_record?.active_assessment !== undefined,
  ).length;

  const prioritized = [...enrollments].sort(
    (a, b) => coursePriority(a) - coursePriority(b),
  );

  const continueEnrollment = prioritized.find((enrollment) => {
    const learningRecord = enrollment.learning_record;

    if (!learningRecord) {
      return false;
    }

    return (
      learningRecord.active_assessment !== null || !learningRecord.completed_at
    );
  });

  return (
    <div className="space-y-8">
      <section>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-3">
              <DashboardMetric
                icon={<GraduationCap className="size-5" />}
                label={dashboard("enrolledCourses")}
                value={data.total}
              />

              <div className="border-t sm:border-t-0 sm:border-l">
                <DashboardMetric
                  icon={<BookOpen className="size-5" />}
                  label={dashboard("coursesStarted")}
                  value={startedCount}
                />
              </div>

              <div className="border-t sm:border-t-0 sm:border-l">
                <DashboardMetric
                  icon={<ClipboardCheck className="size-5" />}
                  label={dashboard("activeAssessments")}
                  value={activeAssessmentCount}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {dashboard("continueLearning")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {dashboard("continueLearningDescription")}
          </p>
        </div>

        {continueEnrollment && continueEnrollment.learning_record ? (
          <ContinueLearningCard
            enrollment={continueEnrollment}
            learningRecord={continueEnrollment.learning_record}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto size-7 text-muted-foreground" />

              <p className="mt-3 font-medium">
                {dashboard("nothingToContinue")}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {dashboard("nothingToContinueDescription")}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          {dashboard("quickAccess")}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/student/courses"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">{student("myCourses")}</p>
              <p className="text-sm text-muted-foreground">
                {dashboard("courseWorkspacesDescription")}
              </p>
            </div>

            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/student/assessments"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ClipboardCheck className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">{assessmentMessages("history")}</p>
              <p className="text-sm text-muted-foreground">
                {dashboard("assessmentHistoryDescription")}
              </p>
            </div>

            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
