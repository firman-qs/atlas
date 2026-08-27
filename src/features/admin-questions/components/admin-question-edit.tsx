"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.questions.detail");
  const tErrors = useTranslations("admin.errors");

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
          {t("backToDetail")}
        </Button>

        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : tErrors("loadQuestions")}
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
        <AlertDescription>{t("incompleteData")}</AlertDescription>
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
          {t("backToDetail")}
        </Button>

        <Alert>
          <AlertDescription>
            {t("mustUnpublish")}
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
        {t("backToDetail")}
      </Button>

      <EditQuestionForm question={question} courseId={concept.course_id} />
    </div>
  );
}
