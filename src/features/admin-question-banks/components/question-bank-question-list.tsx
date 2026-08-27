"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FileQuestion, Loader2, Unlink } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminConcepts,
  useAdminLearningObjectives,
  useAdminSoloLevels,
} from "@/features/admin-curriculum/queries";
import {
  useDetachQuestionFromBank,
  useQuestionBankQuestions,
} from "@/features/admin-question-banks/queries";
import { useMemo } from "react";

interface QuestionBankQuestionListProps {
  questionBankId: string;
  courseId: string;
}

function QuestionListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function QuestionBankQuestionList({
  questionBankId,
  courseId,
}: QuestionBankQuestionListProps) {
  const t = useTranslations("admin.questionBanks.questionList");
  const tBrowser = useTranslations("admin.questionBanks.browser");
  const tErrors = useTranslations("admin.errors");

  const questionsQuery = useQuestionBankQuestions(questionBankId, {
    page: 1,
    pageSize: 100,
  });

  const detachQuestion = useDetachQuestionFromBank(questionBankId);

  const learningObjectivesQuery = useAdminLearningObjectives(courseId);
  const conceptsQuery = useAdminConcepts(courseId);
  const soloLevelsQuery = useAdminSoloLevels();

  const learningObjectiveById = useMemo(
    () =>
      new Map(
        learningObjectivesQuery.data?.items.map((lo) => [lo.id, lo]) ?? [],
      ),
    [learningObjectivesQuery.data?.items],
  );

  const conceptById = useMemo(
    () =>
      new Map(
        conceptsQuery.data?.items.map((concept) => [concept.id, concept]) ?? [],
      ),
    [conceptsQuery.data?.items],
  );

  const soloLevelById = useMemo(
    () =>
      new Map(soloLevelsQuery.data?.map((level) => [level.id, level]) ?? []),
    [soloLevelsQuery.data],
  );

  if (questionsQuery.isPending) {
    return <QuestionListSkeleton />;
  }

  if (questionsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {questionsQuery.error instanceof Error
                ? questionsQuery.error.message
                : tErrors("loadQuestions")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const questions = questionsQuery.data.items;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{t("title")}</CardTitle>

          <Badge variant="outline">
            {t("count", { count: questionsQuery.data.total })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {questions.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">{t("noQuestions")}</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("noQuestionsDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {detachQuestion.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {detachQuestion.error instanceof Error
                    ? detachQuestion.error.message
                    : tErrors("detachQuestion")}
                </AlertDescription>
              </Alert>
            )}

            {questions.map((question) => {
              const learningObjective = learningObjectiveById.get(
                question.learning_objective_id,
              );

              const concept = conceptById.get(question.concept_id);
              const soloLevel = soloLevelById.get(question.solo_level_id);

              return (
                <div key={question.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {question.question_type === "mcq" ? "MCQ" : "Essay"}
                      </Badge>

                      <Badge
                        variant={
                          question.status === "published"
                            ? "default"
                            : "outline"
                        }
                      >
                        {question.status}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => detachQuestion.mutate(question.id)}
                      disabled={detachQuestion.isPending}
                    >
                      {detachQuestion.isPending &&
                      detachQuestion.variables === question.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Unlink />
                      )}
                      {t("detach")}
                    </Button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {question.prompt}
                  </p>

                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    title={`LOC level: ${question.concept_level_id}`}
                  >
                    <Badge variant="outline">
                      {learningObjective?.code.toUpperCase() ?? tBrowser("unknownLO")}
                    </Badge>

                    <Badge variant="outline">
                      {concept?.name ?? tBrowser("unknownConcept")}
                    </Badge>

                    <Badge variant="outline" className="capitalize">
                      {soloLevel?.code ?? tBrowser("unknownSOLO")}
                    </Badge>
                  </div>
                </div>
              );
            })}

            <p className="text-sm text-muted-foreground">
              {t("showingCount", {
                count: questions.length,
                total: questionsQuery.data.total,
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
