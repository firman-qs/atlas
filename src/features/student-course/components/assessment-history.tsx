"use client";

import { ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessments } from "@/features/student-course/queries";

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
          Continue active assessments or review your previous formative
          assessment evidence.
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
        <div className="space-y-3">
          {data.items.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>
                        {assessment.learning_objective.code.toUpperCase()}
                      </CardTitle>

                      <Badge>
                        {assessment.mode === "progress" ? "Progress" : "Review"}
                      </Badge>

                      <Badge variant="outline">{assessment.status}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {assessment.learning_objective.description}
                    </p>
                  </div>

                  {assessment.status === "running" ? (
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/student/assessments/${assessment.id}`} />
                      }
                    >
                      Continue
                      <ArrowRight />
                    </Button>
                  ) : assessment.status === "completed" ? (
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/student/assessments/${assessment.id}/result`}
                        />
                      }
                    >
                      View result
                      <ArrowRight />
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {data.items.length} of {data.total} assessments.
      </p>
    </div>
  );
}
