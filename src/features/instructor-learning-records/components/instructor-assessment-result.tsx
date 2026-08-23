"use client";

import { ArrowLeft, CheckCircle2, CircleX } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function formatSoloCode(code: string) {
  return code
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function InstructorAssessmentResult({
  courseOfferingId,
  learningRecordId,
  assessmentId,
}: InstructorAssessmentResultProps) {
  const resultQuery = useInstructorAssessmentResult(
    courseOfferingId,
    assessmentId,
  );

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
            : "Unable to load assessment result."}
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
        Learning Record
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge>{result.mode === "progress" ? "Progress" : "Review"}</Badge>

          <Badge variant="outline">{result.status}</Badge>

          <Badge variant="secondary">
            {result.total_attempts} attempt
            {result.total_attempts === 1 ? "" : "s"}
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
            <p className="font-medium">No assessment evidence available</p>

            <p className="mt-1 text-sm text-muted-foreground">
              No persisted concept, cycle, or attempt evidence is available for
              this assessment.
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
                        {formatSoloCode(level.solo_code)}
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
                      <div
                        key={cycle.cycle_number}
                        className="rounded-md bg-muted/30 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            Cycle {cycle.cycle_number}
                          </p>

                          <Badge variant="outline">
                            Score {percent(cycle.score)}
                          </Badge>

                          <Badge variant="outline">
                            Required {percent(cycle.mastery_threshold)}
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

                        {cycle.attempts.length === 0 ? (
                          <p className="mt-4 text-sm text-muted-foreground">
                            No attempts were persisted for this cycle.
                          </p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {cycle.attempts.map((attempt, index) => (
                              <div
                                key={attempt.attempt_id}
                                className="rounded-md border bg-background p-4"
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

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                                  {attempt.prompt}
                                </p>

                                <div className="mt-4 rounded-md border bg-muted/20 p-3">
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Student answer
                                  </p>

                                  {attempt.question_type === "essay" ? (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                      {getEssayAnswer(attempt.answer) ??
                                        "Submitted answer is unavailable."}
                                    </p>
                                  ) : (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                      {getMcqSelectedOptionText(
                                        attempt.question_content,
                                        attempt.answer,
                                      ) ?? "Selected option is unavailable."}
                                    </p>
                                  )}
                                </div>

                                {attempt.feedback && (
                                  <div className="mt-4 border-t pt-4">
                                    <p className="text-sm font-medium">
                                      Feedback
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                      {attempt.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
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
