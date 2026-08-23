"use client";

import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorAssessmentHistory } from "@/features/instructor-learning-records/components/instructor-assessment-history";
import { InstructorLearningProgress } from "@/features/instructor-learning-records/components/instructor-learning-progress";
import {
  useInstructorLearningRecord,
  useInstructorLearningRecordProgress,
} from "@/features/instructor-learning-records/queries";

interface InstructorLearningRecordDetailProps {
  courseOfferingId: string;
  learningRecordId: string;
}

function formatSemester(semester: string) {
  return semester.charAt(0).toUpperCase() + semester.slice(1);
}

function LearningRecordSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function InstructorLearningRecordDetail({
  courseOfferingId,
  learningRecordId,
}: InstructorLearningRecordDetailProps) {
  const recordQuery = useInstructorLearningRecord(
    courseOfferingId,
    learningRecordId,
  );

  const progressQuery = useInstructorLearningRecordProgress(
    courseOfferingId,
    learningRecordId,
  );

  if (recordQuery.isPending || progressQuery.isPending) {
    return <LearningRecordSkeleton />;
  }

  if (recordQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {recordQuery.error instanceof Error
            ? recordQuery.error.message
            : "Unable to load learning record."}
        </AlertDescription>
      </Alert>
    );
  }

  if (progressQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {progressQuery.error instanceof Error
            ? progressQuery.error.message
            : "Unable to load learning progress."}
        </AlertDescription>
      </Alert>
    );
  }

  const record = recordQuery.data;
  const progress = progressQuery.data;
  const offering = record.enrollment.course_offering;
  const student = record.enrollment.student;
  const completed = record.completed_at !== null;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={
          <Link href={`/instructor/course-offerings/${courseOfferingId}`} />
        }
      >
        <ArrowLeft />
        Course Offering
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{offering.course.code}</Badge>

          <Badge variant="outline">Section {offering.section}</Badge>

          <Badge variant={completed ? "default" : "secondary"}>
            {completed ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <Clock3 className="size-3" />
            )}

            {completed ? "Completed" : "In progress"}
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {student.full_name}
          </h1>

          <p className="mt-1 text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Record</CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Course</dt>

              <dd className="mt-1 font-medium">{offering.course.title}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Academic term</dt>

              <dd className="mt-1 font-medium">
                {formatSemester(offering.academic_term.semester)}{" "}
                {offering.academic_term.year}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Section</dt>

              <dd className="mt-1 font-medium">Section {offering.section}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>

              <dd className="mt-1 font-medium">
                {completed ? "Completed" : "In progress"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <InstructorLearningProgress progress={progress} />
      <InstructorAssessmentHistory
        courseOfferingId={courseOfferingId}
        learningRecordId={learningRecordId}
      />
    </div>
  );
}
