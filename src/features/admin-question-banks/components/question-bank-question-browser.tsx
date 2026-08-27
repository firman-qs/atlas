"use client";

import { useTranslations } from "next-intl";
import { Loader2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminQuestions,
  useAttachQuestionToBank,
  useQuestionBankQuestions,
} from "@/features/admin-question-banks/queries";

import {
  useAdminConcepts,
  useAdminLearningObjectives,
  useAdminSoloLevels,
} from "@/features/admin-curriculum/queries";

interface QuestionBankQuestionBrowserProps {
  questionBankId: string;
  courseId: string;
}

export function QuestionBankQuestionBrowser({
  questionBankId,
  courseId,
}: QuestionBankQuestionBrowserProps) {
  const t = useTranslations("admin.questionBanks.browser");
  const tErrors = useTranslations("admin.errors");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [questionType, setQuestionType] = useState<"all" | "mcq" | "essay">(
    "all",
  );

  const [status, setStatus] = useState<"all" | "draft" | "published">(
    "published",
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const adminQuestionsQuery = useAdminQuestions({
    courseId,
    page: 1,
    pageSize: 100,
    search,
    questionType: questionType === "all" ? undefined : questionType,
    status: status === "all" ? undefined : status,
  });

  const attachedQuestionsQuery = useQuestionBankQuestions(questionBankId, {
    page: 1,
    pageSize: 100,
  });

  const attachQuestion = useAttachQuestionToBank(questionBankId);

  const attachedQuestionIds = useMemo(
    () =>
      new Set(
        attachedQuestionsQuery.data?.items.map((question) => question.id) ?? [],
      ),
    [attachedQuestionsQuery.data?.items],
  );

  const availableQuestions =
    adminQuestionsQuery.data?.items.filter(
      (question) => !attachedQuestionIds.has(question.id),
    ) ?? [];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-8"
            />
          </div>

          <Select
            value={questionType}
            onValueChange={(value) => {
              if (value === "all" || value === "mcq" || value === "essay") {
                setQuestionType(value);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <span>
                {questionType === "all"
                  ? t("allTypes")
                  : questionType === "mcq"
                    ? "MCQ"
                    : "Essay"}
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "draft" ||
                value === "published"
              ) {
                setStatus(value);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <span>
                {status === "all"
                  ? t("allStatuses")
                  : status === "draft"
                    ? t("draft")
                    : t("published")}
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="published">{t("published")}</SelectItem>
              <SelectItem value="draft">{t("draft")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {attachQuestion.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {attachQuestion.error instanceof Error
                ? attachQuestion.error.message
                : tErrors("attachQuestion")}
            </AlertDescription>
          </Alert>
        )}

        {adminQuestionsQuery.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {adminQuestionsQuery.error instanceof Error
                ? adminQuestionsQuery.error.message
                : tErrors("loadQuestions")}
            </AlertDescription>
          </Alert>
        )}

        {adminQuestionsQuery.isPending || attachedQuestionsQuery.isPending ? (
          <div className="space-y-3">
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
          </div>
        ) : availableQuestions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">{t("noQuestions")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("noQuestionsDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableQuestions.map((question) => {
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
                      onClick={() => attachQuestion.mutate(question.id)}
                      disabled={attachQuestion.isPending}
                    >
                      {attachQuestion.isPending &&
                      attachQuestion.variables === question.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Plus />
                      )}
                      {t("addToBank")}
                    </Button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {question.prompt}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {learningObjective?.code.toUpperCase() ?? t("unknownLO")}
                    </Badge>

                    <Badge variant="outline">
                      {concept?.name ?? t("unknownConcept")}
                    </Badge>

                    <Badge variant="outline" className="capitalize">
                      {soloLevel?.code ?? t("unknownSOLO")}
                    </Badge>
                  </div>
                </div>
              );
            })}

            <p className="text-sm text-muted-foreground">
              {t("showingCount", {
                count: availableQuestions.length,
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
