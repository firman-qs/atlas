"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
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

export function InstructorAssessmentHistory({
  courseOfferingId,
  learningRecordId,
}: InstructorAssessmentHistoryProps) {
  const t = useTranslations("instructor.learningRecords.assessmentHistory");
  const tErrors = useTranslations("instructor.errors");
  const format = useFormatter();

  const assessmentsQuery = useInstructorLearningRecordAssessments(
    courseOfferingId,
    learningRecordId,
    {
      page: 1,
      pageSize: 100,
    },
  );

  function formatDateTime(value: string | null) {
    if (!value) {
      return "—";
    }

    return format.dateTime(new Date(value), {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

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
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {assessmentsQuery.error instanceof Error
                ? assessmentsQuery.error.message
                : tErrors("loadAssessmentHistory")}
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
          <CardTitle>{t("title")}</CardTitle>

          <Badge variant="outline">
            {t("count", { count: assessmentsQuery.data.total })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {assessments.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <ClipboardCheck className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">{t("noAssessments")}</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("noAssessmentsDescription")}
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
                      {assessment.mode === "progress"
                        ? t("modes.progress")
                        : t("modes.review")}
                    </Badge>

                    <Badge variant="secondary" className="capitalize">
                      {assessment.status}
                    </Badge>
                  </div>

                  <AtlasRichTextViewer
                    value={assessment.learning_objective.description}
                    className="text-sm text-muted-foreground"
                  />

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {t("startedAt", {
                        date: formatDateTime(assessment.started_at),
                      })}
                    </span>

                    <span>
                      {t("completedAt", {
                        date: formatDateTime(assessment.completed_at),
                      })}
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
                        aria-label={t("viewEvidenceAria", { code: assessment.learning_objective.code })}
                      />
                    }
                  >
                    {t("viewEvidence")}
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
