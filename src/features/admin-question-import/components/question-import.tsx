"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useImportQuestions } from "@/features/admin-question-import/queries";
import type {
  ImportQuestionResult,
  SkippedQuestion,
} from "@/features/admin-question-import/types";

function formatCode(code: string) {
  return code
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatQuestionType(type: string) {
  if (type === "mcq") {
    return "MCQ";
  }

  return formatCode(type);
}

function SkippedQuestionRow({ question }: { question: SkippedQuestion }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {question.learning_objective_code.toUpperCase()}
        </Badge>

        <Badge variant="secondary">{question.concept_code}</Badge>

        <Badge variant="outline">{formatCode(question.solo_code)}</Badge>

        <Badge variant="outline">
          {formatQuestionType(question.question_type)}
        </Badge>
      </div>

      <div>
        <p className="font-medium">{question.prompt}</p>

        <p className="mt-1 text-sm text-muted-foreground">{question.reason}</p>
      </div>
    </div>
  );
}

function ImportResult({ result }: { result: ImportQuestionResult }) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>Import completed successfully.</AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{result.inserted} inserted</Badge>

        <Badge variant="outline">{result.skipped} skipped</Badge>
      </div>

      {result.skipped_questions.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Skipped questions</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              These questions were not inserted. Review the reason for each
              skipped item below.
            </p>
          </div>

          <div className="space-y-3">
            {result.skipped_questions.map((question, index) => (
              <SkippedQuestionRow
                key={[
                  question.learning_objective_code,
                  question.concept_code,
                  question.solo_code,
                  question.question_type,
                  question.prompt,
                  index,
                ].join(":")}
                question={question}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionImport() {
  const importQuestions = useImportQuestions();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportQuestionResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      return;
    }

    setResult(null);

    try {
      const imported = await importQuestions.mutateAsync(file);

      setResult(imported);
    } catch {
      // Mutation state renders the backend error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Question Package</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Upload an ATLAS TOML question package containing MCQ and essay
          questions mapped to configured learning objectives, concepts, and SOLO
          levels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-package">Question package</Label>

            <Input
              id="question-package"
              type="file"
              accept=".toml,text/plain,application/toml"
              disabled={importQuestions.isPending}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                importQuestions.reset?.();
              }}
            />

            <p className="text-xs text-muted-foreground">
              Select exactly one UTF-8 .toml question package.
            </p>
          </div>

          {importQuestions.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {importQuestions.error instanceof Error
                  ? importQuestions.error.message
                  : "Unable to import question package."}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={!file || importQuestions.isPending}>
            {importQuestions.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileUp />
            )}

            {importQuestions.isPending ? "Importing..." : "Import questions"}
          </Button>
        </form>

        {result && <ImportResult result={result} />}
      </CardContent>
    </Card>
  );
}
