import { QuestionImport } from "@/features/admin-question-import/components/question-import";

export default function AdminQuestionImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Question Import
        </h1>

        <p className="mt-1 text-muted-foreground">
          Import an ATLAS question package from a TOML file.
        </p>
      </div>

      <QuestionImport />
    </div>
  );
}
