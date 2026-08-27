"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, CircleX } from "lucide-react";
import Link from "next/link";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDomainCode,
  soloLevelMessageKey,
} from "@/features/student-course/labels";
import { useInstructorAssessmentResult } from "@/features/instructor-learning-records/queries";
import type {
  AssessmentResultAnswer,
  AssessmentResultQuestionContent,
} from "@/features/student-course/types";

interface InstructorAssessmentResultProps {
  courseOfferingId: string;
  learningRecordId: string;
  assessmentId: string;
}

function percent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function getEssayAnswer(answer: AssessmentResultAnswer): string | null {
  if ("text" in answer) {
    return answer.text;
  }

  return null;
}

function getMcqSelectedOptionText(
  questionContent: AssessmentResultQuestionContent,
  answer: AssessmentResultAnswer,
): string | null {
  if (questionContent.type !== "mcq" || !("option_id" in answer)) {
    return null;
  }

  const selectedOption = questionContent.options.find(
    (option) => option.id === answer.option_id,
  );

  return selectedOption?.text ?? null;
}

export function InstructorAssessmentResult({
  courseOfferingId,
  learningRecordId,
  assessmentId,
}: InstructorAssessmentResultProps) {
  const t = useTranslations("instructor.learningRecords.assessmentResult");
  const tHistory = useTranslations("instructor.learningRecords.assessmentHistory");
  const tSolo = useTranslations("course.soloLevels");
  const tErrors = useTranslations("instructor.errors");

  const resultQuery = useInstructorAssessmentResult(
    courseOfferingId,
    assessmentId,
  );

  function formatSoloLabel(code: string) {
    const key = soloLevelMessageKey(code);
    if (
      key === "unistructural" ||
      key === "multistructural" ||
      key === "relational" ||
      key === "extendedAbstract" ||
      key === "prestructural"
    ) {
      return tSolo(key);
    }
    return formatDomainCode(code);
  }

  if (resultQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (resultQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {resultQuery.error instanceof Error
            ? resultQuery.error.message
            : tErrors("loadAssessmentResult")}
        </AlertDescription>
      </Alert>
    );
  }

  const result = resultQuery.data;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={
          <Link
            href={`/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}`}
          />
        }
      >
        <ArrowLeft />
        {t("backToRecord")}
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge>
            {result.mode === "progress"
              ? tHistory("modes.progress")
              : tHistory("modes.review")}
          </Badge>

          <Badge variant="outline">{result.status}</Badge>

          <Badge variant="secondary">
            {t("attempts", { count: result.total_attempts })}
          </Badge>

          {result.question_bank && (
            <Badge variant="outline">{result.question_bank.name}</Badge>
          )}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          {result.learning_objective.code.toUpperCase()}
        </h1>

        <p className="max-w-3xl text-muted-foreground">
          {result.learning_objective.description}
        </p>
      </div>

      {result.concepts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">{t("noEvidence")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("noEvidenceDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        result.concepts.map((concept) => (
          <Card key={concept.learning_objective_concept_id}>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>{concept.concept_name}</CardTitle>

                <p className="text-sm text-muted-foreground">
                  {concept.concept_code}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {concept.levels.map((level) => (
                <div
                  key={level.loc_level_id}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {formatSoloLabel(level.solo_code)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {t("soloLevel", { level: level.solo_level })}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {t("cycles", { count: level.cycles.length })}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {level.cycles.map((cycle) => (
                      <div
                        key={cycle.cycle_number}
                        className="rounded-md bg-muted/30 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {t("cycle", { number: cycle.cycle_number })}
                          </p>

                          <Badge variant="outline">
                            {t("score", { score: percent(cycle.score) })}
                          </Badge>

                          <Badge variant="outline">
                            {t("required", { required: percent(cycle.mastery_threshold) })}
                          </Badge>

                          {cycle.passed === true && (
                            <Badge>
                              <CheckCircle2 />
                              {t("mastered")}
                            </Badge>
                          )}

                          {cycle.passed === false && (
                            <Badge variant="secondary">
                              <CircleX />
                              {t("notMastered")}
                            </Badge>
                          )}
                        </div>

                        {cycle.attempts.length === 0 ? (
                          <p className="mt-4 text-sm text-muted-foreground">
                            {t("noAttempts")}
                          </p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {cycle.attempts.map((attempt, index) => {
                              const answerText =
                                attempt.question_type === "essay"
                                  ? getEssayAnswer(attempt.answer)
                                  : getMcqSelectedOptionText(
                                      attempt.question_content,
                                      attempt.answer,
                                    );

                              const unavailableAnswer =
                                attempt.question_type === "essay"
                                  ? t("submittedAnswerUnavailable")
                                  : t("selectedOptionUnavailable");
                              return (
                                <div
                                  key={attempt.attempt_id}
                                  className="rounded-md border bg-background p-4"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                      {t("questionNumbered", { number: index + 1 })}
                                    </Badge>

                                    <Badge variant="secondary">
                                      {attempt.question_type === "mcq"
                                        ? t("types.mcq")
                                        : t("types.essay")}
                                    </Badge>

                                    {attempt.is_correct !== null && (
                                      <Badge
                                        variant={
                                          attempt.is_correct
                                            ? "default"
                                            : "destructive"
                                        }
                                      >
                                        {attempt.is_correct
                                          ? t("correct")
                                          : t("incorrect")}
                                      </Badge>
                                    )}

                                    {attempt.score !== null && (
                                      <Badge variant="outline">
                                        {percent(attempt.score)}
                                      </Badge>
                                    )}
                                  </div>

                                  <AtlasRichTextViewer
                                    value={attempt.prompt}
                                    className="mt-3 text-sm leading-6"
                                  />

                                  <div className="mt-4 rounded-md border bg-muted/20 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                      {t("studentAnswer")}
                                    </p>

                                    {answerText ? (
                                      <AtlasRichTextViewer
                                        value={answerText}
                                        className="mt-2 text-sm leading-6"
                                      />
                                    ) : (
                                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {unavailableAnswer}
                                      </p>
                                    )}
                                  </div>

                                  {attempt.feedback && (
                                    <div className="mt-4 border-t pt-4">
                                      <p className="text-sm font-medium">
                                        {t("feedback")}
                                      </p>

                                      <AtlasRichTextViewer
                                        value={attempt.feedback}
                                        className="mt-1 text-sm leading-6 text-muted-foreground"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
