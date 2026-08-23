import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AdminQuestionManager } from "@/features/admin-questions/components/admin-question-manager";

export default function AdminQuestionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Questions</h1>

          <p className="mt-1 text-muted-foreground">
            Manage assessment questions across the ATLAS curriculum.
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/admin/questions/new" />}
        >
          <Plus />
          Create question
        </Button>
      </div>

      <AdminQuestionManager />
    </div>
  );
}
