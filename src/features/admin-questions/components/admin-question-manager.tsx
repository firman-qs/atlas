"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/features/admin-concepts/queries";
import { useAdminSoloLevels } from "@/features/admin-curriculum/queries";
import { useLearningObjectives } from "@/features/admin-learning-objectives/queries";
import { QuestionCard } from "@/features/admin-questions/components/question-card";
import {
  QuestionLibraryFilters,
  type QuestionLibraryFilterValue,
} from "@/features/admin-questions/components/question-library-filters";
import { useAdminQuestions } from "@/features/admin-questions/queries";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";
import type { PaginatedView } from "@/lib/api/types";

interface CourseQuestionMetadataProps {
  courseId: string;
  questions: PaginatedView<AdminQuestionSummary>;
}

function CourseQuestionMetadataList({
  courseId,
  questions,
}: CourseQuestionMetadataProps) {
  const learningObjectivesQuery = useLearningObjectives({
    courseId,
    page: 1,
    pageSize: 100,
  });

  const conceptsQuery = useConcepts({
    courseId,
    page: 1,
    pageSize: 100,
  });

  const soloLevelsQuery = useAdminSoloLevels();

  const learningObjectiveById = useMemo(
    () =>
      new Map(
        learningObjectivesQuery.data?.items.map((learningObjective) => [
          learningObjective.id,
          learningObjective,
        ]) ?? [],
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
      new Map(
        soloLevelsQuery.data?.map((soloLevel) => [soloLevel.id, soloLevel]) ??
          [],
      ),
    [soloLevelsQuery.data],
  );

  return (
    <div className="space-y-3">
      {questions.items.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          learningObjectiveCode={
            learningObjectiveById.get(question.learning_objective_id)?.code
          }
          conceptName={conceptById.get(question.concept_id)?.name}
          soloLevelCode={soloLevelById.get(question.solo_level_id)?.code}
        />
      ))}
    </div>
  );
}

function QuestionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

const initialFilters: QuestionLibraryFilterValue = {
  search: "",
};

export function AdminQuestionManager() {
  const t = useTranslations("admin.questions");
  const tErrors = useTranslations("admin.errors");

  const [filters, setFilters] =
    useState<QuestionLibraryFilterValue>(initialFilters);

  const questionsQuery = useAdminQuestions({
    courseId: filters.courseId,
    learningObjectiveId: filters.learningObjectiveId,
    conceptId: filters.conceptId,
    soloLevelId: filters.soloLevelId,
    search: filters.search,
    questionType: filters.questionType,
    status: filters.status,
    page: 1,
    pageSize: 100,
  });

  const questions = questionsQuery.data;

  const hasFilters =
    filters.search !== "" ||
    filters.courseId !== undefined ||
    filters.learningObjectiveId !== undefined ||
    filters.conceptId !== undefined ||
    filters.soloLevelId !== undefined ||
    filters.questionType !== undefined ||
    filters.status !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{t("libraryTitle")}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("libraryDescription")}
            </p>
          </div>

          {questions && (
            <div className="flex items-center gap-2">
              {questionsQuery.isFetching && !questionsQuery.isPending && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}

              <Badge variant="outline">
                {t("count", { count: questions.total })}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <QuestionLibraryFilters value={filters} onChange={setFilters} />

        {questionsQuery.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {questionsQuery.error instanceof Error
                ? questionsQuery.error.message
                : tErrors("loadQuestions")}
            </AlertDescription>
          </Alert>
        )}

        {questionsQuery.isPending ? (
          <QuestionListSkeleton />
        ) : !questions ? null : questions.items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">
              {hasFilters ? t("noMatchingQuestions") : t("noQuestions")}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? t("noMatchingDescription")
                : t("noQuestionsDescription")}
            </p>
          </div>
        ) : filters.courseId ? (
          <CourseQuestionMetadataList
            courseId={filters.courseId}
            questions={questions}
          />
        ) : (
          <div className="space-y-3">
            {questions.items.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}

        {questions && questions.items.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("showingCount", {
              count: questions.items.length,
              total: questions.total,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
