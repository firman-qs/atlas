"use client";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelAssessmentButton } from "@/features/student-course/components/cancel-assessment-button";
import { learningObjectiveNumber } from "@/features/student-course/labels";
import {
  useAssessments,
  useStartAssessment,
} from "@/features/student-course/queries";
import type { Assessment } from "@/features/student-course/types";
import { cn } from "@/lib/utils";
import { ArrowRight, ClipboardCheck, LoaderCircle, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type AssessmentPresentationState = "ready" | "active" | "historical";

function assessmentPresentationState(
  status: Assessment["status"],
): AssessmentPresentationState {
  if (status === "created") {
    return "ready";
  }

  if (status === "running") {
    return "active";
  }

  return "historical";
}

function AssessmentActions({ assessment }: { assessment: Assessment }) {
  const messages = useTranslations("assessment");
  const errors = useTranslations("errors");
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

            {startAssessment.isPending
              ? messages("starting")
              : messages("startAssessment")}
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
                : errors("startAssessment")}
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
          {messages("continue")}
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
        {messages("viewResult")}
        <ArrowRight />
      </Button>
    );
  }

  return null;
}

export function AssessmentHistory() {
  const messages = useTranslations("assessment");
  const course = useTranslations("course");
  const errors = useTranslations("errors");
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
            : errors("assessmentHistory")}
        </AlertDescription>
      </Alert>
    );
  }

  const data = assessments.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {messages("title")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {messages("historyDescription")}
        </p>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 font-medium">{messages("noAssessments")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((assessment) => {
            const presentationState = assessmentPresentationState(
              assessment.status,
            );
            const objectiveNumber = learningObjectiveNumber(
              assessment.learning_objective.code,
              assessment.learning_objective.display_order,
            );

            return (
              <Card
                key={assessment.id}
                data-testid={`assessment-history-${assessment.id}`}
                data-assessment-state={presentationState}
                className={cn(
                  "transition-colors",
                  presentationState === "active" &&
                    "bg-primary/3 ring-primary/25",
                  presentationState === "historical" && "bg-muted/15",
                )}
              >
                <CardHeader>
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>
                          {objectiveNumber === null
                            ? course("progress.learningObjective")
                            : course("progress.learningObjectiveNumbered", {
                                number: objectiveNumber,
                              })}
                        </CardTitle>

                        <Badge variant="secondary">
                          {messages(`modes.${assessment.mode}`)}
                        </Badge>

                        <Badge
                          variant={
                            presentationState === "active"
                              ? "default"
                              : presentationState === "ready"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {messages(`statuses.${assessment.status}`)}
                        </Badge>
                      </div>

                      <AtlasRichTextViewer
                        value={assessment.learning_objective.description}
                        className="max-w-2xl text-sm leading-6 text-muted-foreground"
                      />

                      {presentationState === "active" && (
                        <p className="text-xs font-medium text-primary">
                          {messages("statusHint.running")}
                        </p>
                      )}

                      {presentationState === "ready" && (
                        <p className="text-xs text-muted-foreground">
                          {messages("statusHint.created")}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 sm:pt-0.5">
                      <AssessmentActions assessment={assessment} />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {messages("assessmentCount", {
          shown: data.items.length,
          total: data.total,
        })}
      </p>
    </div>
  );
}
