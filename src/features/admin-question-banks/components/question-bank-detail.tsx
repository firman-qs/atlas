"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Library, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteQuestionBankButton } from "@/features/admin-question-banks/components/delete-question-bank-button";
import { QuestionBankQuestionBrowser } from "@/features/admin-question-banks/components/question-bank-question-browser";
import { QuestionBankQuestionList } from "@/features/admin-question-banks/components/question-bank-question-list";
import { useQuestionBank } from "@/features/admin-question-banks/queries";
import { EditQuestionBankForm } from "./edit-question-bank-form";

interface QuestionBankDetailProps {
  questionBankId: string;
}

function QuestionBankDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36" />

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-64" />
        </CardHeader>

        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

export function QuestionBankDetail({
  questionBankId,
}: QuestionBankDetailProps) {
  const t = useTranslations("admin.questionBanks");
  const tDetail = useTranslations("admin.questionBanks.detail");
  const tErrors = useTranslations("admin.errors");

  const questionBankQuery = useQuestionBank(questionBankId);
  const [isEditing, setIsEditing] = useState(false);

  if (questionBankQuery.isPending) {
    return <QuestionBankDetailSkeleton />;
  }

  if (questionBankQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {questionBankQuery.error instanceof Error
            ? questionBankQuery.error.message
            : tErrors("loadQuestionBanks")}
        </AlertDescription>
      </Alert>
    );
  }

  const bank = questionBankQuery.data;

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="ghost"
        render={<Link href="/admin/question-banks" />}
      >
        <ArrowLeft />
        {tDetail("backToBanks")}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Library className="size-5" />

                <Badge variant="outline">{bank.code}</Badge>

                {bank.is_student_selectable ? (
                  <Badge>{t("studentSelectable")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("adminOnly")}</Badge>
                )}
              </div>

              <CardTitle className="text-2xl">{bank.name}</CardTitle>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing((current) => !current)}
              >
                <Pencil />
                {isEditing ? tDetail("closeEditor") : tDetail("editBank")}
              </Button>

              <DeleteQuestionBankButton bank={bank} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {isEditing ? (
            <EditQuestionBankForm
              bank={bank}
              onCancel={() => setIsEditing(false)}
              onSaved={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div>
                <p className="text-sm font-medium">{tDetail("description")}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {bank.description ?? t("noDescription")}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">{tDetail("courseId")}</p>

                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">
                  {bank.course_id}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <QuestionBankQuestionList
        questionBankId={questionBankId}
        courseId={bank.course_id}
      />
      <QuestionBankQuestionBrowser
        questionBankId={questionBankId}
        courseId={bank.course_id}
      />
    </div>
  );
}
