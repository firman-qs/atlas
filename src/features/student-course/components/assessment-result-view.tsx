"use client";

import { ArrowLeft, CheckCircle2, CircleX } from "lucide-react";
import Link from "next/link";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { learningObjectiveLabel } from "@/features/student-course/labels";
import { useAssessmentResult } from "@/features/student-course/queries";
import type {
  AssessmentResultAnswer,
  AssessmentResultQuestionContent,
} from "@/features/student-course/types";

interface AssessmentResultViewProps {
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

export function AssessmentResultView({
  assessmentId,
}: AssessmentResultViewProps) {
  const resultQuery = useAssessmentResult(assessmentId);

  if (resultQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (resultQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl">
        <Alert variant="destructive">
          <AlertDescription>
            {resultQuery.error instanceof Error
              ? resultQuery.error.message
              : "Unable to load assessment result."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const result = resultQuery.data;

  if (!result) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/student/assessments" />}
      >
        <ArrowLeft />
        Assessment history
      </Button>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {result.mode === "progress" ? "Progress" : "Review"}
          </Badge>
          <Badge variant="outline">{result.status}</Badge>
          <Badge variant="outline">{result.total_attempts} attempts</Badge>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          {learningObjectiveLabel(result.learning_objective.code)}
        </h1>

        <p className="max-w-3xl text-muted-foreground">
          {result.learning_objective.description}
        </p>
      </div>

      {result.concepts.map((concept) => (
        <Card key={concept.learning_objective_concept_id}>
          <CardHeader className="border-b">
            <div className="space-y-1">
              <CardTitle className="text-lg">{concept.concept_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {concept.concept_code}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="divide-y">
              {concept.levels.map((level) => (
                <section
                  key={level.loc_level_id}
                  className="space-y-4 py-6 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium capitalize">
                        {level.solo_code}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        SOLO level {level.solo_level}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {level.cycles.length} cycle
                      {level.cycles.length === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {level.cycles.map((cycle) => (
                      <section
                        key={cycle.cycle_number}
                        className="rounded-lg bg-muted/25 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="mr-1 text-sm font-semibold">
                            Cycle {cycle.cycle_number}
                          </p>

                          <Badge variant="outline">
                            Score {percent(cycle.score)}
                          </Badge>

                          {cycle.passed === true && (
                            <Badge>
                              <CheckCircle2 />
                              Mastered
                            </Badge>
                          )}

                          {cycle.passed === false && (
                            <Badge variant="secondary">
                              <CircleX />
                              Not mastered
                            </Badge>
                          )}
                        </div>

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
                                ? "Submitted answer is unavailable."
                                : "Selected option is unavailable.";
                            return (
                              <article
                                key={attempt.attempt_id}
                                className="rounded-lg bg-background p-4 ring-1 ring-foreground/10"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline">
                                    Question {index + 1}
                                  </Badge>

                                  <Badge variant="secondary">
                                    {attempt.question_type === "mcq"
                                      ? "MCQ"
                                      : "Essay"}
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
                                        ? "Correct"
                                        : "Incorrect"}
                                    </Badge>
                                  )}

                                  {attempt.score !== null && (
                                    <Badge variant="outline">
                                      {percent(attempt.score)}
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-4 rounded-lg bg-muted/20 p-3">
                                  <AtlasRichTextViewer
                                    value={attempt.prompt}
                                    className="text-sm leading-6"
                                  />
                                </div>

                                <div className="mt-3 rounded-lg bg-muted/30 p-3">
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Your answer
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
                                  <div className="mt-3 rounded-lg bg-muted/20 p-3">
                                    <p className="text-sm font-medium">
                                      Feedback
                                    </p>

                                    <AtlasRichTextViewer
                                      value={attempt.feedback}
                                      className="mt-1 text-sm leading-6 text-muted-foreground"
                                    />
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
