"use client";

import { useTranslations } from "next-intl";
import { CurriculumImport } from "@/features/admin-curriculum-import/components/curriculum-import";

export default function AdminCurriculumImportPage() {
  const t = useTranslations("admin.curriculumImport");

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

      <CurriculumImport />
    </div>
  );
}
