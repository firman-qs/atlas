"use client";

import { useTranslations } from "next-intl";
import { QuestionImport } from "@/features/admin-question-import/components/question-import";

export default function AdminQuestionImportPage() {
  const t = useTranslations("admin.questionImport");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <QuestionImport />
    </div>
  );
}
