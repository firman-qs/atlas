"use client";

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
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
      <span className="font-medium">{label}</span>

      <Badge variant="outline">
        {stats.inserted} inserted · {stats.skipped} skipped
      </Badge>
    </div>
  );
}

function ImportResult({ result }: { result: ImportCurriculumResult }) {
  return (
    <div className="space-y-3">
      <Alert>
        <AlertDescription>Import completed successfully.</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <ImportStatRow label="Course" stats={result.course} />

        <ImportStatRow
          label="Learning objectives"
          stats={result.learning_objectives}
        />

        <ImportStatRow label="Concepts" stats={result.concepts} />

        <ImportStatRow
          label="LO–concept mappings"
          stats={result.learning_objective_concepts}
        />

        <ImportStatRow
          label="Configured SOLO levels"
          stats={result.learning_objective_concept_levels}
        />
      </div>
    </div>
  );
}

export function CurriculumImport() {
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
        <CardTitle>Import Curriculum Package</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">
            Upload an ATLAS TOML curriculum package containing a course,
            learning objectives, concepts, concept mappings, and configured SOLO
            levels.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curriculum-package">Curriculum package</Label>

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
              Select exactly one UTF-8 .toml curriculum package.
            </p>
          </div>

          {importCurriculum.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {importCurriculum.error instanceof Error
                  ? importCurriculum.error.message
                  : "Unable to import curriculum package."}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={!file || importCurriculum.isPending}>
            {importCurriculum.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileUp />
            )}

            {importCurriculum.isPending ? "Importing..." : "Import curriculum"}
          </Button>
        </form>

        {result && <ImportResult result={result} />}
      </CardContent>
    </Card>
  );
}
