"use client";

import { useTranslations } from "next-intl";
import { FileUp, Loader2 } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useImportCurriculum } from "@/features/admin-curriculum-import/queries";
import type {
  ImportCurriculumResult,
  ImportStats,
} from "@/features/admin-curriculum-import/types";

function ImportStatRow({
  label,
  stats,
}: {
  label: string;
  stats: ImportStats;
}) {
  const t = useTranslations("admin.curriculumImport");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
      <span className="font-medium">{label}</span>

      <Badge variant="outline">
        {t("stats", {
          inserted: stats.inserted,
          skipped: stats.skipped,
        })}
      </Badge>
    </div>
  );
}

function ImportResult({ result }: { result: ImportCurriculumResult }) {
  const t = useTranslations("admin.curriculumImport");

  return (
    <div className="space-y-3">
      <Alert>
        <AlertDescription>{t("success")}</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <ImportStatRow label={t("rows.course")} stats={result.course} />

        <ImportStatRow
          label={t("rows.learningObjectives")}
          stats={result.learning_objectives}
        />

        <ImportStatRow label={t("rows.concepts")} stats={result.concepts} />

        <ImportStatRow
          label={t("rows.mappings")}
          stats={result.learning_objective_concepts}
        />

        <ImportStatRow
          label={t("rows.soloLevels")}
          stats={result.learning_objective_concept_levels}
        />
      </div>
    </div>
  );
}

export function CurriculumImport() {
  const t = useTranslations("admin.curriculumImport");
  const tErrors = useTranslations("admin.errors");

  const importCurriculum = useImportCurriculum();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportCurriculumResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      return;
    }

    setResult(null);

    try {
      const imported = await importCurriculum.mutateAsync(file);

      setResult(imported);
    } catch {
      // Mutation state renders the backend error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("cardDescription")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curriculum-package">{t("packageLabel")}</Label>

            <Input
              id="curriculum-package"
              type="file"
              accept=".toml,text/plain,application/toml"
              disabled={importCurriculum.isPending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                importCurriculum.reset?.();
              }}
            />

            <p className="text-xs text-muted-foreground">
              {t("helpText")}
            </p>
          </div>

          {importCurriculum.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {importCurriculum.error instanceof Error
                  ? importCurriculum.error.message
                  : tErrors("importCurriculum")}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={!file || importCurriculum.isPending}>
            {importCurriculum.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileUp />
            )}

            {importCurriculum.isPending ? t("importing") : t("importButton")}
          </Button>
        </form>

        {result && <ImportResult result={result} />}
      </CardContent>
    </Card>
  );
}
