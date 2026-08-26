"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

function formatSemester(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const progressQuery = useLearningRecordProgress(learningRecord.id);

  const offering = enrollment.course_offering;
  const course = offering.course;
  const activeAssessment = learningRecord.active_assessment;

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

                {activeAssessment && <Badge>Assessment in progress</Badge>}
              </div>

              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                {course.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Section {offering.section}
                {" · "}
                {formatSemester(offering.academic_term.semester)}{" "}
                {offering.academic_term.year}
                {" · "}
                {course.credits} credit
                {course.credits === 1 ? "" : "s"}
                {" · "}
                {offering.instructor.full_name}
              </p>

              {activeAssessment && (
                <p className="mt-3 text-sm font-medium">
                  {activeAssessment.mode === "progress"
                    ? "Progress assessment"
                    : "Review assessment"}
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
                  Continue assessment
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
                  Open course
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
                AI Tutor
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/20 p-5 sm:p-6">
          <p className="text-sm font-medium">Course progress</p>

          {progressQuery.isPending ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : progressQuery.isError ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Learning progress is temporarily unavailable.
            </p>
          ) : (
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Learning Objectives
                  </span>

                  <span className="text-sm font-medium">
                    {masteredLearningObjectives} of {learningObjectives.length}{" "}
                    mastered
                  </span>
                </div>

                <Progress value={learningObjectivePercent} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Concepts
                  </span>

                  <span className="text-sm font-medium">
                    {masteredConcepts} of {concepts.length} mastered
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
            : "Unable to load your dashboard."}
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
                label="Enrolled Courses"
                value={data.total}
              />

              <div className="border-t sm:border-t-0 sm:border-l">
                <DashboardMetric
                  icon={<BookOpen className="size-5" />}
                  label="Courses Started"
                  value={startedCount}
                />
              </div>

              <div className="border-t sm:border-t-0 sm:border-l">
                <DashboardMetric
                  icon={<ClipboardCheck className="size-5" />}
                  label="Active Assessments"
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
            Continue Learning
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Continue your current learning activity or assessment.
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

              <p className="mt-3 font-medium">Nothing to continue right now</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Open one of your courses to continue learning or start an
                assessment.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Quick Access</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/student/courses"
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">My Courses</p>
              <p className="text-sm text-muted-foreground">
                Open your learning workspaces.
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
              <p className="font-medium">Assessment History</p>
              <p className="text-sm text-muted-foreground">
                Continue or review formative assessments.
              </p>
            </div>

            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
