import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { learningObjectiveLabel } from "@/features/student-course/labels";
import {
  ArrowRight,
  ClipboardCheck,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelAssessmentButton } from "@/features/student-course/components/cancel-assessment-button";
import {
  useCreateProgressAssessment,
  useCreateReviewAssessment,
  useStartAssessment,
  useStudentQuestionBanks,
} from "@/features/student-course/queries";
import type { AssessmentOptions } from "@/features/student-course/types";

interface AssessmentOptionsProps {
  options: AssessmentOptions;
  learningRecordId: string;
}

function modeLabel(mode: "progress" | "review") {
  return mode === "progress" ? "Progress" : "Review";
}

function formatSoloCode(code: string) {
  return code
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AssessmentOptionsPanel({
  options,
  learningRecordId,
}: AssessmentOptionsProps) {
  const createProgressAssessment =
    useCreateProgressAssessment(learningRecordId);
  const startAssessment = useStartAssessment(learningRecordId);
  const createReviewAssessment = useCreateReviewAssessment(learningRecordId);
  const questionBanksQuery = useStudentQuestionBanks(learningRecordId);
  const [selectedQuestionBankId, setSelectedQuestionBankId] =
    useState<string>("all");
  const selectedQuestionBank =
    selectedQuestionBankId === "all" ? null : selectedQuestionBankId;
  const router = useRouter();

  const selectedQuestionBankLabel =
    selectedQuestionBankId === "all"
      ? "All available questions"
      : (questionBanksQuery.data?.items.find(
          (bank) => bank.id === selectedQuestionBankId,
        )?.name ?? "Selected question bank");

  if (options.active_assessment) {
    const assessment = options.active_assessment;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ClipboardCheck className="size-5" />

                  <p className="font-medium">Active assessment</p>

                  <Badge>{modeLabel(assessment.mode)}</Badge>

                  <Badge variant="outline">{assessment.status}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {assessment.status === "created"
                    ? "This assessment is ready to begin."
                    : "Finish your current assessment before starting another one."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {assessment.status === "created" ? (
                  <Button
                    onClick={() => {
                      startAssessment.mutate(assessment.id, {
                        onSuccess: () => {
                          router.push(`/student/assessments/${assessment.id}`);
                        },
                      });
                    }}
                    disabled={startAssessment.isPending}
                  >
                    {startAssessment.isPending ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <ClipboardCheck />
                    )}

                    {startAssessment.isPending
                      ? "Starting..."
                      : "Start assessment"}
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/student/assessments/${assessment.id}`} />
                    }
                  >
                    Continue assessment
                    <ArrowRight />
                  </Button>
                )}

                <CancelAssessmentButton
                  assessmentId={assessment.id}
                  learningRecordId={learningRecordId}
                />
              </div>
            </div>

            {startAssessment.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {startAssessment.error instanceof Error
                    ? startAssessment.error.message
                    : "Unable to start assessment."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Assessments</CardTitle>

          <p className="text-sm text-muted-foreground">
            Progress assessments advance mastery. Review assessments revisit
            material you have already mastered.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {options.progress ? (
          <section
            data-testid="progress-assessment"
            className="rounded-xl border bg-background/60 p-4 sm:p-5"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardCheck className="size-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">Progress assessment</p>
                      <Badge>Available</Badge>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Your next mastery assessment
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Badge variant="outline">
                    {learningObjectiveLabel(
                      options.progress.learning_objective.code,
                      options.progress.learning_objective.display_order,
                    )}
                  </Badge>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {options.progress.learning_objective.description}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!options.progress) {
                    return;
                  }

                  createProgressAssessment.mutate(
                    options.progress.learning_objective.id,
                  );
                }}
                disabled={createProgressAssessment.isPending}
              >
                {createProgressAssessment.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <ClipboardCheck />
                )}

                {createProgressAssessment.isPending
                  ? "Creating..."
                  : "Start progress assessment"}
              </Button>
            </div>

            {createProgressAssessment.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {createProgressAssessment.error instanceof Error
                    ? createProgressAssessment.error.message
                    : "Unable to create assessment."}
                </AlertDescription>
              </Alert>
            )}
          </section>
        ) : (
          <section
            data-testid="progress-assessment"
            className="rounded-xl border bg-muted/25 p-4 sm:p-5"
          >
            <p className="font-medium">Progress assessment unavailable</p>

            <p className="mt-1 text-sm text-muted-foreground">
              There is currently no progress assessment available for this
              learning record.
            </p>
          </section>
        )}

        <div className="border-t" aria-hidden="true" />

        {options.review.length === 0 ? (
          <section
            data-testid="review-assessments"
            className="rounded-xl border bg-muted/25 p-4 sm:p-5"
          >
            <div className="flex gap-3">
              <div className="mt-0.5">
                <LockKeyhole className="size-5 text-muted-foreground" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Review assessments</p>

                  <Badge variant="secondary">Locked</Badge>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review assessments become available after you master material.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section data-testid="review-assessments" className="space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <RotateCcw className="size-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">Review assessments</p>

                      <Badge variant="outline">
                        {options.review.length} learning objective
                        {options.review.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Revisit material you have already mastered.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] lg:items-end">
                <div>
                  <p className="text-sm font-medium">Question source</p>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                    Use all eligible published questions or choose a specific
                    student-selectable question bank for this review.
                  </p>
                </div>

                <div className="min-w-0">
                  {questionBanksQuery.isError ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {questionBanksQuery.error instanceof Error
                          ? questionBanksQuery.error.message
                          : "Unable to load question banks."}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select
                      value={selectedQuestionBankId}
                      onValueChange={(value) => {
                        if (value) {
                          setSelectedQuestionBankId(value);
                        }
                      }}
                      disabled={questionBanksQuery.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <span className="truncate">
                          {questionBanksQuery.isPending
                            ? "Loading question banks..."
                            : selectedQuestionBankLabel}
                        </span>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All available questions
                        </SelectItem>

                        {questionBanksQuery.data?.items.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {selectedQuestionBankId !== "all" && (
                <p className="mt-3 text-xs text-muted-foreground lg:text-right">
                  This review will use only eligible published questions from
                  the selected question bank.
                </p>
              )}
            </div>

            <div className="space-y-4">
              {options.review.map((review) => (
                <section
                  key={review.learning_objective.id}
                  className="overflow-hidden rounded-xl border bg-background/60"
                >
                  <div className="flex flex-col justify-between gap-4 border-b bg-muted/20 p-4 sm:flex-row sm:items-start sm:p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {learningObjectiveLabel(
                            review.learning_objective.code,
                            review.learning_objective.display_order,
                          )}
                        </Badge>

                        {review.can_review_learning_objective && (
                          <Badge>Whole objective available</Badge>
                        )}
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {review.learning_objective.description}
                      </p>
                    </div>

                    {review.can_review_learning_objective && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() =>
                          createReviewAssessment.mutate({
                            learningObjectiveId: review.learning_objective.id,
                            reviewTarget: {
                              scope: "learning_objective",
                            },
                            questionBankId: selectedQuestionBank,
                          })
                        }
                        disabled={createReviewAssessment.isPending}
                      >
                        <RotateCcw />
                        Review learning objective
                      </Button>
                    )}
                  </div>

                  {review.concepts.length > 0 && (
                    <div className="divide-y px-4 sm:px-5">
                      {review.concepts.map((concept) => (
                        <div
                          key={concept.learning_objective_concept_id}
                          className="py-4 first:pt-4 last:pb-4 sm:py-5"
                        >
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">
                                  {concept.concept.name}
                                </p>

                                <Badge
                                  variant="secondary"
                                  className="font-mono"
                                >
                                  {concept.concept.code}
                                </Badge>

                                {concept.can_review_concept && (
                                  <Badge variant="outline">
                                    Concept review
                                  </Badge>
                                )}
                              </div>

                              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {concept.concept.description}
                              </p>
                            </div>

                            {concept.can_review_concept && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                                onClick={() =>
                                  createReviewAssessment.mutate({
                                    learningObjectiveId:
                                      review.learning_objective.id,
                                    reviewTarget: {
                                      scope: "concept",
                                      learning_objective_concept_id:
                                        concept.learning_objective_concept_id,
                                    },
                                    questionBankId: selectedQuestionBank,
                                  })
                                }
                                disabled={createReviewAssessment.isPending}
                              >
                                <RotateCcw />
                                Review concept
                              </Button>
                            )}
                          </div>

                          {concept.mastered_levels.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Review by SOLO level
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {concept.mastered_levels.map((level) => (
                                  <Button
                                    key={level.loc_level_id}
                                    size="sm"
                                    variant="ghost"
                                    className="border bg-muted/25"
                                    onClick={() =>
                                      createReviewAssessment.mutate({
                                        learningObjectiveId:
                                          review.learning_objective.id,
                                        reviewTarget: {
                                          scope: "level",
                                          learning_objective_concept_id:
                                            concept.learning_objective_concept_id,
                                          loc_level_id: level.loc_level_id,
                                        },
                                        questionBankId: selectedQuestionBank,
                                      })
                                    }
                                    disabled={createReviewAssessment.isPending}
                                  >
                                    <RotateCcw />
                                    {formatSoloCode(level.solo_code)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {createReviewAssessment.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createReviewAssessment.error instanceof Error
                    ? createReviewAssessment.error.message
                    : "Unable to create review assessment."}
                </AlertDescription>
              </Alert>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
