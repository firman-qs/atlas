"use client";

import { ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorLearningRecordAssessments } from "@/features/instructor-learning-records/queries";

interface InstructorAssessmentHistoryProps {
  courseOfferingId: string;
  learningRecordId: string;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function InstructorAssessmentHistory({
  courseOfferingId,
  learningRecordId,
}: InstructorAssessmentHistoryProps) {
  const assessmentsQuery = useInstructorLearningRecordAssessments(
    courseOfferingId,
    learningRecordId,
    {
      page: 1,
      pageSize: 100,
    },
  );

  if (assessmentsQuery.isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (assessmentsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {assessmentsQuery.error instanceof Error
                ? assessmentsQuery.error.message
                : "Unable to load assessment history."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const assessments = assessmentsQuery.data.items;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Assessment History</CardTitle>

          <Badge variant="outline">
            {assessmentsQuery.data.total} assessment
            {assessmentsQuery.data.total === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {assessments.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <ClipboardCheck className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">No assessments yet</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Assessment activity for this learning record will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {assessment.learning_objective.code.toUpperCase()}
                    </Badge>

                    <Badge>
                      {assessment.mode === "progress" ? "Progress" : "Review"}
                    </Badge>

                    <Badge variant="secondary" className="capitalize">
                      {assessment.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {assessment.learning_objective.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Started {formatDateTime(assessment.started_at)}</span>

                    <span>
                      Completed {formatDateTime(assessment.completed_at)}
                    </span>
                  </div>
                </div>

                {(assessment.status === "completed" ||
                  assessment.status === "canceled") && (
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}/assessments/${assessment.id}`}
                        aria-label={`View evidence for ${assessment.learning_objective.code}`}
                      />
                    }
                  >
                    View evidence
                    <ArrowRight />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
