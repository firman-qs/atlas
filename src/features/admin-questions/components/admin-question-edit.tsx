"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcept } from "@/features/admin-concepts/queries";
import { EditQuestionForm } from "@/features/admin-questions/components/edit-question-form";
import { useAdminQuestion } from "@/features/admin-questions/queries";

interface AdminQuestionEditProps {
  questionId: string;
}

function QuestionEditSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export function AdminQuestionEdit({ questionId }: AdminQuestionEditProps) {
  const questionQuery = useAdminQuestion(questionId);

  const conceptId = questionQuery.data?.concept_id ?? "";
  const conceptQuery = useConcept(conceptId);

  const isPending = questionQuery.isPending || conceptQuery.isPending;

  if (isPending) {
    return <QuestionEditSkeleton />;
  }

  const error = questionQuery.error ?? conceptQuery.error;

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href={`/admin/questions/${questionId}`} />}
        >
          <ArrowLeft />
          Question detail
        </Button>

        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Unable to load question for editing."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const question = questionQuery.data;
  const concept = conceptQuery.data;

  if (!question || !concept) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Question edit data was incomplete.</AlertDescription>
      </Alert>
    );
  }

  if (question.status !== "draft") {
    return (
      <div className="space-y-4">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href={`/admin/questions/${questionId}`} />}
        >
          <ArrowLeft />
          Question detail
        </Button>

        <Alert>
          <AlertDescription>
            Published questions must be unpublished before they can be edited.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href={`/admin/questions/${questionId}`} />}
      >
        <ArrowLeft />
        Question detail
      </Button>

      <EditQuestionForm question={question} courseId={concept.course_id} />
    </div>
  );
}
