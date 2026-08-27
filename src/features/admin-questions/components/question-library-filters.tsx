"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/features/admin-concepts/queries";
import { useAdminCourses } from "@/features/admin-courses/queries";
import { useLearningObjectiveConcepts } from "@/features/admin-learning-objectives/concepts-queries";
import { useLearningObjectiveConceptLevels } from "@/features/admin-learning-objectives/levels-queries";
import { useLearningObjectives } from "@/features/admin-learning-objectives/queries";
import type {
  AdminQuestionStatus,
  AdminQuestionType,
} from "@/features/admin-questions/types";

export interface QuestionLibraryFilterValue {
  search: string;
  courseId?: string;
  learningObjectiveId?: string;
  conceptId?: string;
  soloLevelId?: string;
  questionType?: AdminQuestionType;
  status?: AdminQuestionStatus;
}

interface QuestionLibraryFiltersProps {
  value: QuestionLibraryFilterValue;
  onChange: (value: QuestionLibraryFilterValue) => void;
}

interface CourseCurriculumFiltersProps {
  value: QuestionLibraryFilterValue;
  onChange: (value: QuestionLibraryFilterValue) => void;
}

interface LearningObjectiveConceptFilterProps {
  value: QuestionLibraryFilterValue;
  onChange: (value: QuestionLibraryFilterValue) => void;
  learningObjectiveId: string;
}

interface SoloLevelFilterProps {
  value: QuestionLibraryFilterValue;
  onChange: (value: QuestionLibraryFilterValue) => void;
  learningObjectiveId: string;
  conceptId: string;
}

function SoloLevelFilter({
  value,
  onChange,
  learningObjectiveId,
  conceptId,
}: SoloLevelFilterProps) {
  const tFilters = useTranslations("admin.questions.filters");
  const levelsQuery = useLearningObjectiveConceptLevels(
    learningObjectiveId,
    conceptId,
  );

  if (levelsQuery.isPending) {
    return <Skeleton className="h-9 w-full" />;
  }

  const levels = levelsQuery.data ?? [];

  return (
    <Select
      value={value.soloLevelId ?? "all"}
      disabled={levelsQuery.isError}
      onValueChange={(soloLevelId) =>
        onChange({
          ...value,
          soloLevelId:
            soloLevelId && soloLevelId !== "all" ? soloLevelId : undefined,
        })
      }
    >
      <SelectTrigger className="w-full">
        <span>
          {value.soloLevelId
            ? (levels.find((level) => level.solo_level.id === value.soloLevelId)
                ?.solo_level.code ?? tFilters("soloLevel"))
            : tFilters("allSolo")}
        </span>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">{tFilters("allSolo")}</SelectItem>

        {levels.map((level) => (
          <SelectItem key={level.solo_level.id} value={level.solo_level.id}>
            {level.solo_level.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LearningObjectiveConceptFilter({
  value,
  onChange,
  learningObjectiveId,
}: LearningObjectiveConceptFilterProps) {
  const tFilters = useTranslations("admin.questions.filters");
  const attachedConceptsQuery =
    useLearningObjectiveConcepts(learningObjectiveId);

  if (attachedConceptsQuery.isPending) {
    return (
      <>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </>
    );
  }

  const attachedConcepts = attachedConceptsQuery.data?.items ?? [];

  return (
    <>
      <Select
        value={value.conceptId ?? "all"}
        disabled={attachedConceptsQuery.isError}
        onValueChange={(conceptId) =>
          onChange({
            ...value,
            conceptId: conceptId && conceptId !== "all" ? conceptId : undefined,
            soloLevelId: undefined,
          })
        }
      >
        <SelectTrigger className="w-full">
          <span>
            {value.conceptId
              ? (attachedConcepts.find(
                  (item) => item.concept.id === value.conceptId,
                )?.concept.name ?? tFilters("concept"))
              : tFilters("allConcepts")}
          </span>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{tFilters("allConcepts")}</SelectItem>

          {attachedConcepts.map((item) => (
            <SelectItem key={item.concept.id} value={item.concept.id}>
              {item.concept.code} — {item.concept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.conceptId ? (
        <SoloLevelFilter
          value={value}
          onChange={onChange}
          learningObjectiveId={learningObjectiveId}
          conceptId={value.conceptId}
        />
      ) : (
        <Select disabled value="all">
          <SelectTrigger className="w-full">
            <span>{tFilters("selectConceptFirst")}</span>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{tFilters("allSolo")}</SelectItem>
          </SelectContent>
        </Select>
      )}
    </>
  );
}

function CourseCurriculumFilters({
  value,
  onChange,
}: CourseCurriculumFiltersProps) {
  const tFilters = useTranslations("admin.questions.filters");
  const courseId = value.courseId!;

  const learningObjectivesQuery = useLearningObjectives({
    courseId,
    page: 1,
    pageSize: 100,
  });

  // This query is useful when no LO is selected because the Concept filter may
  // still operate at course scope.
  const courseConceptsQuery = useConcepts({
    courseId,
    page: 1,
    pageSize: 100,
  });

  if (learningObjectivesQuery.isPending) {
    return (
      <>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </>
    );
  }

  const learningObjectives = learningObjectivesQuery.data?.items ?? [];
  const courseConcepts = courseConceptsQuery.data?.items ?? [];

  return (
    <>
      <Select
        value={value.learningObjectiveId ?? "all"}
        onValueChange={(learningObjectiveId) =>
          onChange({
            ...value,
            learningObjectiveId:
              learningObjectiveId && learningObjectiveId !== "all"
                ? learningObjectiveId
                : undefined,
            conceptId: undefined,
            soloLevelId: undefined,
          })
        }
      >
        <SelectTrigger className="w-full">
          <span>
            {value.learningObjectiveId
              ? (learningObjectives
                  .find((lo) => lo.id === value.learningObjectiveId)
                  ?.code.toUpperCase() ?? tFilters("learningObjective"))
              : tFilters("allLOs")}
          </span>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{tFilters("allLOs")}</SelectItem>

          {learningObjectives.map((learningObjective) => (
            <SelectItem key={learningObjective.id} value={learningObjective.id}>
              {learningObjective.code.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.learningObjectiveId ? (
        <LearningObjectiveConceptFilter
          value={value}
          onChange={onChange}
          learningObjectiveId={value.learningObjectiveId}
        />
      ) : (
        <>
          <Select
            value={value.conceptId ?? "all"}
            disabled={
              courseConceptsQuery.isPending || courseConceptsQuery.isError
            }
            onValueChange={(conceptId) =>
              onChange({
                ...value,
                conceptId:
                  conceptId && conceptId !== "all" ? conceptId : undefined,
                soloLevelId: undefined,
              })
            }
          >
            <SelectTrigger className="w-full">
              <span>
                {value.conceptId
                  ? (courseConcepts.find(
                      (concept) => concept.id === value.conceptId,
                    )?.name ?? tFilters("concept"))
                  : tFilters("allConcepts")}
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{tFilters("allConcepts")}</SelectItem>

              {courseConcepts.map((concept) => (
                <SelectItem key={concept.id} value={concept.id}>
                  {concept.code} — {concept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select disabled value="all">
            <SelectTrigger className="w-full">
              <span>{tFilters("selectLOAndConceptFirst")}</span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">{tFilters("allSolo")}</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );
}

export function QuestionLibraryFilters({
  value,
  onChange,
}: QuestionLibraryFiltersProps) {
  const t = useTranslations("admin.questions");
  const tFilters = useTranslations("admin.questions.filters");
  const [searchInput, setSearchInput] = useState(value.search);

  const coursesQuery = useAdminCourses({
    page: 1,
    pageSize: 100,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const search = searchInput.trim();

      if (search !== value.search) {
        onChange({
          ...value,
          search,
        });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [onChange, searchInput, value]);

  const courses = coursesQuery.data?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={tFilters("searchPlaceholder")}
            className="pl-8"
          />
        </div>

        <Select
          value={value.courseId ?? "all"}
          disabled={coursesQuery.isPending || coursesQuery.isError}
          onValueChange={(courseId) =>
            onChange({
              ...value,
              courseId: courseId && courseId !== "all" ? courseId : undefined,
              learningObjectiveId: undefined,
              conceptId: undefined,
              soloLevelId: undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <span>
              {value.courseId
                ? (courses.find((course) => course.id === value.courseId)
                    ?.code ?? tFilters("course"))
                : tFilters("allCourses")}
            </span>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{tFilters("allCourses")}</SelectItem>

            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code} — {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.questionType ?? "all"}
          onValueChange={(questionType) =>
            onChange({
              ...value,
              questionType:
                questionType === "mcq" || questionType === "essay"
                  ? questionType
                  : undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <span>
              {value.questionType === "mcq"
                ? t("types.mcq")
                : value.questionType === "essay"
                  ? t("types.essay")
                  : tFilters("allTypes")}
            </span>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{tFilters("allTypes")}</SelectItem>
            <SelectItem value="mcq">{t("types.mcq")}</SelectItem>
            <SelectItem value="essay">{t("types.essay")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.status ?? "all"}
          onValueChange={(status) =>
            onChange({
              ...value,
              status:
                status === "draft" || status === "published"
                  ? status
                  : undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <span>
              {value.status === "draft"
                ? t("statuses.draft")
                : value.status === "published"
                  ? t("statuses.published")
                  : tFilters("allStatuses")}
            </span>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{tFilters("allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("statuses.draft")}</SelectItem>
            <SelectItem value="published">{t("statuses.published")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {value.courseId ? (
          <CourseCurriculumFilters value={value} onChange={onChange} />
        ) : (
          <>
            <Select disabled value="all">
              <SelectTrigger className="w-full">
                <span>{tFilters("selectCourseFirst")}</span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{tFilters("allLOs")}</SelectItem>
              </SelectContent>
            </Select>

            <Select disabled value="all">
              <SelectTrigger className="w-full">
                <span>{tFilters("selectCourseFirst")}</span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{tFilters("allConcepts")}</SelectItem>
              </SelectContent>
            </Select>

            <Select disabled value="all">
              <SelectTrigger className="w-full">
                <span>{tFilters("selectCourseFirst")}</span>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">{tFilters("allSolo")}</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
