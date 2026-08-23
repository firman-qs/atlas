"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcept } from "@/features/admin-concepts/queries";
import { useAdminCourse } from "@/features/admin-courses/queries";
import { useAdminSoloLevels } from "@/features/admin-curriculum/queries";
import { useLearningObjectives } from "@/features/admin-learning-objectives/queries";
import { QuestionDetailView } from "@/features/admin-questions/components/question-detail-view";
import { QuestionLifecycleActions } from "@/features/admin-questions/components/question-lifecycle-actions";
import { useAdminQuestion } from "@/features/admin-questions/queries";
interface AdminQuestionDetailProps {
  questionId: string;
}

function QuestionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />

      <div className="space-y-3 rounded-lg border p-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>

        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

export function AdminQuestionDetail({ questionId }: AdminQuestionDetailProps) {
  const questionQuery = useAdminQuestion(questionId);

  const conceptId = questionQuery.data?.concept_id ?? "";
  const conceptQuery = useConcept(conceptId);

  const courseId = conceptQuery.data?.course_id ?? "";
  const courseQuery = useAdminCourse(courseId);

  const learningObjectivesQuery = useLearningObjectives({
    courseId,
    page: 1,
    pageSize: 100,
  });

  const soloLevelsQuery = useAdminSoloLevels();

  const isPending =
    questionQuery.isPending ||
    conceptQuery.isPending ||
    courseQuery.isPending ||
    learningObjectivesQuery.isPending ||
    soloLevelsQuery.isPending;

  if (isPending) {
    return <QuestionDetailSkeleton />;
  }

  const error =
    questionQuery.error ??
    conceptQuery.error ??
    courseQuery.error ??
    learningObjectivesQuery.error ??
    soloLevelsQuery.error;

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href="/admin/questions" />}
        >
          <ArrowLeft />
          Questions
        </Button>

        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Unable to load question details."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const question = questionQuery.data;

  if (!question) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Question response did not contain data.
        </AlertDescription>
      </Alert>
    );
  }

  const concept = conceptQuery.data;
  const course = courseQuery.data;

  const learningObjective = learningObjectivesQuery.data?.items.find(
    (item) => item.id === question.learning_objective_id,
  );

  const soloLevel = soloLevelsQuery.data?.find(
    (item) => item.id === question.solo_level_id,
  );

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/admin/questions" />}
      >
        <ArrowLeft />
        Questions
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Question Detail
          </h1>

          <p className="mt-1 text-muted-foreground">
            Review the question, curriculum placement, and assessment content.
          </p>
        </div>

        <QuestionLifecycleActions question={question} />
      </div>

      <QuestionDetailView
        question={question}
        courseCode={course?.code}
        learningObjectiveCode={learningObjective?.code}
        conceptCode={concept?.code}
        conceptName={concept?.name}
        soloLevelCode={soloLevel?.code}
      />
    </div>
  );
}
