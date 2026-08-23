"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCourses } from "@/features/admin-courses/queries";
import { useLearningObjectiveConcepts } from "@/features/admin-learning-objectives/concepts-queries";
import { useLearningObjectiveConceptLevels } from "@/features/admin-learning-objectives/levels-queries";
import { useLearningObjectives } from "@/features/admin-learning-objectives/queries";

export interface QuestionPlacementValue {
  courseId?: string;
  learningObjectiveId?: string;
  conceptId?: string;
  soloLevelId?: string;
}

interface QuestionPlacementFieldsProps {
  value: QuestionPlacementValue;
  onChange: (value: QuestionPlacementValue) => void;
  disabled?: boolean;
}

interface LearningObjectivePlacementProps extends QuestionPlacementFieldsProps {
  courseId: string;
}

interface ConceptPlacementProps extends QuestionPlacementFieldsProps {
  learningObjectiveId: string;
}

interface SoloPlacementProps extends QuestionPlacementFieldsProps {
  learningObjectiveId: string;
  conceptId: string;
}

function SoloPlacement({
  value,
  onChange,
  learningObjectiveId,
  conceptId,
  disabled = false,
}: SoloPlacementProps) {
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
      value={value.soloLevelId ?? ""}
      disabled={disabled || levelsQuery.isError || levels.length === 0}
      onValueChange={(soloLevelId) =>
        onChange({
          ...value,
          soloLevelId: soloLevelId || undefined,
        })
      }
    >
      <SelectTrigger className="w-full">
        <span>
          {value.soloLevelId
            ? (levels.find((level) => level.solo_level.id === value.soloLevelId)
                ?.solo_level.code ?? "SOLO level")
            : levels.length === 0
              ? "No configured SOLO levels"
              : "Select SOLO level"}
        </span>
      </SelectTrigger>

      <SelectContent>
        {levels.map((level) => (
          <SelectItem key={level.id} value={level.solo_level.id}>
            {level.solo_level.code} — threshold{" "}
            {Math.round(level.mastery_threshold * 100)}%
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ConceptPlacement({
  value,
  onChange,
  learningObjectiveId,
  disabled = false,
}: ConceptPlacementProps) {
  const conceptsQuery = useLearningObjectiveConcepts(learningObjectiveId);

  if (conceptsQuery.isPending) {
    return (
      <>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </>
    );
  }

  const concepts = conceptsQuery.data?.items ?? [];

  return (
    <>
      <Select
        value={value.conceptId ?? ""}
        disabled={disabled || conceptsQuery.isError || concepts.length === 0}
        onValueChange={(conceptId) =>
          onChange({
            ...value,
            conceptId: conceptId || undefined,
            soloLevelId: undefined,
          })
        }
      >
        <SelectTrigger className="w-full">
          <span>
            {value.conceptId
              ? (concepts.find((item) => item.concept.id === value.conceptId)
                  ?.concept.name ?? "Concept")
              : concepts.length === 0
                ? "No attached concepts"
                : "Select concept"}
          </span>
        </SelectTrigger>

        <SelectContent>
          {concepts.map((item) => (
            <SelectItem key={item.id} value={item.concept.id}>
              {item.concept.code} — {item.concept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.conceptId ? (
        <SoloPlacement
          value={value}
          onChange={onChange}
          learningObjectiveId={learningObjectiveId}
          conceptId={value.conceptId}
          disabled={disabled}
        />
      ) : (
        <Select disabled value="">
          <SelectTrigger className="w-full">
            <span>Select concept first</span>
          </SelectTrigger>
        </Select>
      )}
    </>
  );
}

function LearningObjectivePlacement({
  value,
  onChange,
  courseId,
  disabled = false,
}: LearningObjectivePlacementProps) {
  const learningObjectivesQuery = useLearningObjectives({
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

  return (
    <>
      <Select
        value={value.learningObjectiveId ?? ""}
        disabled={
          disabled ||
          learningObjectivesQuery.isError ||
          learningObjectives.length === 0
        }
        onValueChange={(learningObjectiveId) =>
          onChange({
            ...value,
            learningObjectiveId: learningObjectiveId || undefined,
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
                  ?.code.toUpperCase() ?? "Learning objective")
              : learningObjectives.length === 0
                ? "No learning objectives"
                : "Select learning objective"}
          </span>
        </SelectTrigger>

        <SelectContent>
          {learningObjectives.map((learningObjective) => (
            <SelectItem key={learningObjective.id} value={learningObjective.id}>
              {learningObjective.code.toUpperCase()} —{" "}
              {learningObjective.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.learningObjectiveId ? (
        <ConceptPlacement
          value={value}
          onChange={onChange}
          learningObjectiveId={value.learningObjectiveId}
          disabled={disabled}
        />
      ) : (
        <>
          <Select disabled value="">
            <SelectTrigger className="w-full">
              <span>Select learning objective first</span>
            </SelectTrigger>
          </Select>

          <Select disabled value="">
            <SelectTrigger className="w-full">
              <span>Select concept first</span>
            </SelectTrigger>
          </Select>
        </>
      )}
    </>
  );
}

export function QuestionPlacementFields({
  value,
  onChange,
  disabled = false,
}: QuestionPlacementFieldsProps) {
  const coursesQuery = useAdminCourses({
    page: 1,
    pageSize: 100,
  });

  if (coursesQuery.isPending) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  const courses = coursesQuery.data?.items ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Select
        value={value.courseId ?? ""}
        disabled={disabled || coursesQuery.isError || courses.length === 0}
        onValueChange={(courseId) =>
          onChange({
            courseId: courseId || undefined,
            learningObjectiveId: undefined,
            conceptId: undefined,
            soloLevelId: undefined,
          })
        }
      >
        <SelectTrigger className="w-full">
          <span>
            {value.courseId
              ? (courses.find((course) => course.id === value.courseId)?.code ??
                "Course")
              : courses.length === 0
                ? "No courses"
                : "Select course"}
          </span>
        </SelectTrigger>

        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.code} — {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.courseId ? (
        <LearningObjectivePlacement
          value={value}
          onChange={onChange}
          courseId={value.courseId}
          disabled={disabled}
        />
      ) : (
        <>
          <Select disabled value="">
            <SelectTrigger className="w-full">
              <span>Select course first</span>
            </SelectTrigger>
          </Select>

          <Select disabled value="">
            <SelectTrigger className="w-full">
              <span>Select learning objective first</span>
            </SelectTrigger>
          </Select>

          <Select disabled value="">
            <SelectTrigger className="w-full">
              <span>Select concept first</span>
            </SelectTrigger>
          </Select>
        </>
      )}
    </div>
  );
}
