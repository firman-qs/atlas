import { CurriculumImport } from "@/features/admin-curriculum-import/components/curriculum-import";

export default function AdminCurriculumImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Curriculum Import
        </h1>

        <p className="mt-1 text-muted-foreground">
          Import an ATLAS curriculum package from a TOML file.
        </p>
      </div>

      <CurriculumImport />
    </div>
  );
}
