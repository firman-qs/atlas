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
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ClipboardCheck className="size-5" />

                  <p className="font-medium">Progress assessment</p>

                  <Badge>Available</Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {learningObjectiveLabel(
                      options.progress.learning_objective.code,
                      options.progress.learning_objective.display_order,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
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
          <section className="rounded-lg bg-muted/30 p-4">
            <p className="font-medium">Progress assessment unavailable</p>

            <p className="mt-1 text-sm text-muted-foreground">
              There is currently no progress assessment available for this
              learning record.
            </p>
          </section>
        )}

        <div className="border-t" />

        {options.review.length === 0 ? (
          <section className="rounded-lg bg-muted/30 p-4">
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
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <RotateCcw className="size-5" />

              <p className="font-medium">Review assessments</p>

              <Badge variant="outline">
                {options.review.length} learning objective
                {options.review.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="space-y-3 rounded-lg bg-muted/30 p-4">
              <div>
                <p className="text-sm font-medium">Question source</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Choose whether this review uses all eligible published
                  questions or a specific student-selectable question bank.
                </p>
              </div>

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
                    <SelectItem value="all">All available questions</SelectItem>

                    {questionBanksQuery.data?.items.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedQuestionBankId !== "all" && (
                <p className="text-xs text-muted-foreground">
                  This assessment will use only eligible published questions
                  contained in the selected question bank.
                </p>
              )}
            </div>

            <div className="space-y-3">
              {options.review.map((review) => (
                <section
                  key={review.learning_objective.id}
                  className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {learningObjectiveLabel(
                        review.learning_objective.code,
                        review.learning_objective.display_order,
                      )}
                    </Badge>

                    {review.can_review_learning_objective && (
                      <>
                        <Badge>Whole learning objective available</Badge>

                        <Button
                          size="sm"
                          variant="outline"
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
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {review.learning_objective.description}
                  </p>

                  {review.concepts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {review.concepts.map((concept) => (
                        <div
                          key={concept.learning_objective_concept_id}
                          className="rounded-lg bg-background/70 p-3 ring-1 ring-foreground/10"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">
                              {concept.concept.name}
                            </p>

                            {concept.can_review_concept && (
                              <>
                                <Badge variant="secondary">
                                  Concept review
                                </Badge>

                                <Button
                                  size="sm"
                                  variant="outline"
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
                              </>
                            )}
                          </div>

                          {concept.mastered_levels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {concept.mastered_levels.map((level) => (
                                <Button
                                  key={level.loc_level_id}
                                  size="sm"
                                  variant="outline"
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
                                  {level.solo_code}
                                </Button>
                              ))}
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
