"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CancelAssessmentButton } from "@/features/student-course/components/cancel-assessment-button";
import {
  studentAssessmentKeys,
  useAssessment,
  useIssueNextQuestion,
  useSubmitAttempt,
} from "@/features/student-course/queries";
import type {
  AssessmentQuestion,
  SubmitAttemptResult,
} from "@/features/student-course/types";
import { ApiError } from "@/lib/api/api-error";

interface AssessmentRunnerProps {
  assessmentId: string;
}

function formatMode(mode: "progress" | "review") {
  return mode === "progress" ? "Progress" : "Review";
}

function isConflictError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

export function AssessmentRunner({ assessmentId }: AssessmentRunnerProps) {
  const queryClient = useQueryClient();

  const assessmentQuery = useAssessment(assessmentId);
  const issueQuestion = useIssueNextQuestion(assessmentId);

  const requestedInitialQuestion = useRef(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [attemptResult, setAttemptResult] =
    useState<SubmitAttemptResult | null>(null);

  const cachedQuestion = queryClient.getQueryData<AssessmentQuestion>(
    studentAssessmentKeys.question(assessmentId),
  );

  const assessment = assessmentQuery.data;

  const submitAttempt = useSubmitAttempt(
    assessmentId,
    assessment?.learning_record_id ?? "",
  );

  function clearQuestionState() {
    queryClient.removeQueries({
      queryKey: studentAssessmentKeys.question(assessmentId),
      exact: true,
    });

    setSelectedOptionId(null);
    setEssayAnswer("");
  }

  async function reconcileAssessmentState() {
    clearQuestionState();
    setAttemptResult(null);

    requestedInitialQuestion.current = false;

    await queryClient.invalidateQueries({
      queryKey: studentAssessmentKeys.detail(assessmentId),
      exact: true,
    });

    await queryClient.refetchQueries({
      queryKey: studentAssessmentKeys.detail(assessmentId),
      exact: true,
    });
  }

  useEffect(() => {
    if (
      !assessment ||
      assessment.status !== "running" ||
      requestedInitialQuestion.current ||
      cachedQuestion
    ) {
      return;
    }

    requestedInitialQuestion.current = true;

    issueQuestion.mutate(undefined, {
      onError: () => {
        requestedInitialQuestion.current = false;
      },
    });
  }, [assessment, cachedQuestion, issueQuestion]);

  useEffect(() => {
    if (
      assessment?.status === "completed" ||
      assessment?.status === "canceled"
    ) {
      queryClient.removeQueries({
        queryKey: studentAssessmentKeys.question(assessmentId),
        exact: true,
      });

      requestedInitialQuestion.current = false;
    }
  }, [assessment?.status, assessmentId, queryClient]);

  if (assessmentQuery.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (assessmentQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {assessmentQuery.error instanceof Error
              ? assessmentQuery.error.message
              : "Unable to load assessment."}
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          onClick={() => {
            void assessmentQuery.refetch();
          }}
          disabled={assessmentQuery.isFetching}
        >
          {assessmentQuery.isFetching ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <RefreshCw />
          )}

          {assessmentQuery.isFetching ? "Retrying..." : "Retry"}
        </Button>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const question = queryClient.getQueryData<AssessmentQuestion>(
    studentAssessmentKeys.question(assessmentId),
  );

  function handleSubmit(question: AssessmentQuestion) {
    const onSuccess = (result: SubmitAttemptResult) => {
      setAttemptResult(result);
    };

    const onError = (error: unknown) => {
      if (isConflictError(error)) {
        void reconcileAssessmentState();
      }
    };

    if (question.content.type === "mcq") {
      if (!selectedOptionId) {
        return;
      }

      submitAttempt.mutate(
        {
          answer: {
            option_id: selectedOptionId,
          },
        },
        {
          onSuccess,
          onError,
        },
      );

      return;
    }

    const text = essayAnswer.trim();

    if (!text) {
      return;
    }

    submitAttempt.mutate(
      {
        answer: {
          text,
        },
      },
      {
        onSuccess,
        onError,
      },
    );
  }

  function handleNextQuestion() {
    setAttemptResult(null);
    setSelectedOptionId(null);
    setEssayAnswer("");

    queryClient.removeQueries({
      queryKey: studentAssessmentKeys.question(assessmentId),
      exact: true,
    });

    issueQuestion.mutate(undefined, {
      onError: () => {
        requestedInitialQuestion.current = false;
      },
    });
  }

  function handleRetryQuestion() {
    requestedInitialQuestion.current = true;

    issueQuestion.mutate(undefined, {
      onError: () => {
        requestedInitialQuestion.current = false;
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/student/courses" />}
          >
            <ArrowLeft />
            Back to courses
          </Button>

          {assessment.status === "running" && (
            <CancelAssessmentButton
              assessmentId={assessment.id}
              learningRecordId={assessment.learning_record_id}
              onCanceled={() => {
                clearQuestionState();
                setAttemptResult(null);

                void queryClient.invalidateQueries({
                  queryKey: studentAssessmentKeys.detail(assessment.id),
                  exact: true,
                });
              }}
            />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{formatMode(assessment.mode)}</Badge>

            <Badge variant="outline">{assessment.status}</Badge>

            {assessment.current_cycle_number !== null && (
              <Badge variant="secondary">
                Cycle {assessment.current_cycle_number}
              </Badge>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {assessment.learning_objective.code.toUpperCase()}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {assessment.learning_objective.description}
          </p>
        </div>
      </div>

      {assessment.status === "completed" && !attemptResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Assessment completed</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This assessment has been completed.
            </p>

            <Button
              nativeButton={false}
              render={
                <Link href={`/student/assessments/${assessment.id}/result`} />
              }
            >
              View assessment result
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : assessment.status === "canceled" ? (
        <Card>
          <CardHeader>
            <CardTitle>Assessment canceled</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This assessment has been canceled and cannot be continued.
            </p>

            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/student/courses" />}
            >
              Return to courses
            </Button>
          </CardContent>
        </Card>
      ) : assessment.status === "created" ? (
        <Alert>
          <ClipboardCheck className="size-4" />

          <AlertDescription>
            This assessment has not been started yet. Return to the course
            workspace and start it before answering questions.
          </AlertDescription>
        </Alert>
      ) : issueQuestion.isPending && !question ? (
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              Preparing your question...
            </div>
          </CardContent>
        </Card>
      ) : issueQuestion.isError && !question ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to prepare question</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {issueQuestion.error instanceof Error
                  ? issueQuestion.error.message
                  : "Unable to load the assessment question."}
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={handleRetryQuestion}
              disabled={issueQuestion.isPending}
            >
              {issueQuestion.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <RefreshCw />
              )}

              {issueQuestion.isPending ? "Retrying..." : "Retry question"}
            </Button>
          </CardContent>
        </Card>
      ) : question ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Question</CardTitle>

              <Badge variant="secondary">
                {question.content.type === "mcq" ? "Multiple choice" : "Essay"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="whitespace-pre-wrap text-base leading-7">
              {question.prompt}
            </p>

            {question.content.type === "mcq" ? (
              <div className="space-y-3">
                {question.content.options.map((option) => {
                  const selected = selectedOptionId === option.id;

                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={selected ? "secondary" : "outline"}
                      disabled={
                        submitAttempt.isPending || attemptResult !== null
                      }
                      onClick={() => setSelectedOptionId(option.id)}
                      className="h-auto w-full justify-start whitespace-normal p-4 text-left"
                    >
                      <span className="flex-1">{option.option_text}</span>

                      {selected && <Badge variant="secondary">Selected</Badge>}
                    </Button>
                  );
                })}

                {!attemptResult && (
                  <Button
                    onClick={() => handleSubmit(question)}
                    disabled={!selectedOptionId || submitAttempt.isPending}
                  >
                    {submitAttempt.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}

                    {submitAttempt.isPending
                      ? "Submitting..."
                      : "Submit answer"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={essayAnswer}
                  onChange={(event) => setEssayAnswer(event.target.value)}
                  disabled={submitAttempt.isPending || attemptResult !== null}
                  placeholder="Write your answer here..."
                  rows={8}
                  className="resize-y"
                />

                {!attemptResult && (
                  <Button
                    onClick={() => handleSubmit(question)}
                    disabled={
                      essayAnswer.trim().length === 0 || submitAttempt.isPending
                    }
                  >
                    {submitAttempt.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}

                    {submitAttempt.isPending
                      ? "Evaluating..."
                      : "Submit answer"}
                  </Button>
                )}
              </div>
            )}

            {submitAttempt.isError && !attemptResult && (
              <Alert variant="destructive">
                <AlertDescription>
                  {isConflictError(submitAttempt.error)
                    ? "The assessment changed while your answer was being submitted. ATLAS is synchronizing with the current assessment state."
                    : submitAttempt.error instanceof Error
                      ? submitAttempt.error.message
                      : "Unable to submit your answer."}
                </AlertDescription>
              </Alert>
            )}

            {attemptResult && (
              <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">Answer evaluated</p>

                  {attemptResult.is_correct !== null && (
                    <Badge
                      variant={
                        attemptResult.is_correct ? "default" : "destructive"
                      }
                    >
                      {attemptResult.is_correct ? "Correct" : "Incorrect"}
                    </Badge>
                  )}

                  {attemptResult.score !== null && (
                    <Badge variant="outline">
                      Score {Math.round(attemptResult.score * 100)}%
                    </Badge>
                  )}
                </div>

                {attemptResult.feedback && (
                  <div>
                    <p className="text-sm font-medium">Feedback</p>

                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {attemptResult.feedback}
                    </p>
                  </div>
                )}

                {attemptResult.cycle_completed && (
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">Cycle complete</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {attemptResult.cycle_score !== null && (
                        <Badge variant="outline">
                          Cycle score{" "}
                          {Math.round(attemptResult.cycle_score * 100)}%
                        </Badge>
                      )}

                      <Badge variant="outline">
                        Required{" "}
                        {Math.round(attemptResult.mastery_threshold * 100)}%
                      </Badge>

                      <Badge
                        variant={
                          attemptResult.level_mastered ? "default" : "secondary"
                        }
                      >
                        {attemptResult.level_mastered
                          ? "Level mastered"
                          : "Level not yet mastered"}
                      </Badge>
                    </div>
                  </div>
                )}

                {attemptResult.assessment_status === "completed" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
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

                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={<Link href="/student/courses" />}
                    >
                      Return to courses
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={issueQuestion.isPending}
                  >
                    {issueQuestion.isPending ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <ArrowRight />
                    )}

                    {issueQuestion.isPending ? "Preparing..." : "Next question"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
