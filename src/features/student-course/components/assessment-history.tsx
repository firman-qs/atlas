"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelAssessmentButton } from "@/features/student-course/components/cancel-assessment-button";
import { learningObjectiveLabel } from "@/features/student-course/labels";
import {
  useAssessments,
  useStartAssessment,
} from "@/features/student-course/queries";
import type { Assessment } from "@/features/student-course/types";
import { ArrowRight, ClipboardCheck, LoaderCircle, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function AssessmentActions({ assessment }: { assessment: Assessment }) {
  const router = useRouter();
  const startAssessment = useStartAssessment(assessment.learning_record_id);

  async function handleStart() {
    try {
      await startAssessment.mutateAsync(assessment.id);

      router.push(`/student/assessments/${assessment.id}`);
    } catch {
      // Mutation error is rendered below.
    }
  }

  if (assessment.status === "created") {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void handleStart()}
            disabled={startAssessment.isPending}
          >
            {startAssessment.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Play />
            )}

            {startAssessment.isPending ? "Starting..." : "Start assessment"}
          </Button>

          <CancelAssessmentButton
            assessmentId={assessment.id}
            learningRecordId={assessment.learning_record_id}
          />
        </div>

        {startAssessment.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {startAssessment.error instanceof Error
                ? startAssessment.error.message
                : "Unable to start assessment."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (assessment.status === "running") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={<Link href={`/student/assessments/${assessment.id}`} />}
        >
          Continue
          <ArrowRight />
        </Button>

        <CancelAssessmentButton
          assessmentId={assessment.id}
          learningRecordId={assessment.learning_record_id}
        />
      </div>
    );
  }

  if (assessment.status === "completed") {
    return (
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/student/assessments/${assessment.id}/result`} />}
      >
        View result
        <ArrowRight />
      </Button>
    );
  }

  return null;
}

export function AssessmentHistory() {
  const assessments = useAssessments(1, 20);

  if (assessments.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (assessments.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {assessments.error instanceof Error
            ? assessments.error.message
            : "Unable to load assessment history."}
        </AlertDescription>
      </Alert>
    );
  }

  const data = assessments.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assessments</h1>

        <p className="mt-1 text-muted-foreground">
          Start or continue active assessments and review your previous
          formative assessment evidence.
        </p>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 font-medium">No assessments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>
                        {learningObjectiveLabel(
                          assessment.learning_objective.code,
                          assessment.learning_objective.display_order,
                        )}
                      </CardTitle>

                      <Badge variant="secondary">
                        {assessment.mode === "progress" ? "Progress" : "Review"}
                      </Badge>

                      <Badge variant="outline" className="capitalize">
                        {assessment.status}
                      </Badge>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      {assessment.learning_objective.description}
                    </p>
                  </div>

                  <div className="shrink-0 sm:pt-0.5">
                    <AssessmentActions assessment={assessment} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {data.items.length} of {data.total} assessments.
      </p>
    </div>
  );
}
