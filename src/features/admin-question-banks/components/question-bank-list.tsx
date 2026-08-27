"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestionBanks } from "@/features/admin-question-banks/queries";
import { Library } from "lucide-react";
import Link from "next/link";

function QuestionBankListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function QuestionBankList() {
  const t = useTranslations("admin.questionBanks");
  const tErrors = useTranslations("admin.errors");

  const questionBanksQuery = useQuestionBanks({
    page: 1,
    pageSize: 20,
  });

  if (questionBanksQuery.isPending) {
    return <QuestionBankListSkeleton />;
  }

  if (questionBanksQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {questionBanksQuery.error instanceof Error
            ? questionBanksQuery.error.message
            : tErrors("loadQuestionBanks")}
        </AlertDescription>
      </Alert>
    );
  }

  const questionBanks = questionBanksQuery.data.items;

  if (questionBanks.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Library className="size-5 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">{t("noBanks")}</h2>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {t("noBanksDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {questionBanks.map((bank) => (
          <Card key={bank.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{bank.code}</Badge>

                {bank.is_student_selectable ? (
                  <Badge>{t("studentSelectable")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("adminOnly")}</Badge>
                )}
              </div>

              <CardTitle>{bank.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="min-h-10 text-sm text-muted-foreground">
                {bank.description ?? t("noDescription")}
              </p>

              <Button
                className="w-full"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/admin/question-banks/${bank.id}`} />}
              >
                {t("openBank")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {t("showingCount", {
          count: questionBanks.length,
          total: questionBanksQuery.data.total,
        })}
      </p>
    </div>
  );
}
