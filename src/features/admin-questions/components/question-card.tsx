import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuestionCardProps {
  question: AdminQuestionSummary;
  learningObjectiveCode?: string;
  conceptName?: string;
  soloLevelCode?: string;
}

export function QuestionCard({
  question,
  learningObjectiveCode,
  conceptName,
  soloLevelCode,
}: QuestionCardProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {question.question_type === "mcq" ? "MCQ" : "Essay"}
          </Badge>

          <Badge
            variant={question.status === "published" ? "default" : "outline"}
            className="capitalize"
          >
            {question.status}
          </Badge>

          {learningObjectiveCode && (
            <Badge variant="outline">
              {learningObjectiveCode.toUpperCase()}
            </Badge>
          )}

          {conceptName && <Badge variant="outline">{conceptName}</Badge>}

          {soloLevelCode && (
            <Badge variant="outline" className="capitalize">
              {soloLevelCode.replaceAll("_", " ")}
            </Badge>
          )}
        </div>
        <Button
          nativeButton={false}
          size="sm"
          variant="outline"
          render={<Link href={`/admin/questions/${question.id}`} />}
        >
          Open
          <ArrowRight />
        </Button>
      </div>

      <AtlasRichTextViewer
        value={question.prompt}
        className="mt-3 text-sm leading-6"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {question.content.type === "mcq" ? (
          <>
            <span>
              {question.content.options.length} option
              {question.content.options.length === 1 ? "" : "s"}
            </span>

            <span>
              {question.content.is_option_shuffled
                ? "Options shuffled"
                : "Fixed option order"}
            </span>
          </>
        ) : (
          <span>Essay response</span>
        )}

        <span className="font-mono" title={question.id}>
          {question.id.slice(0, 8)}…
        </span>
      </div>
    </div>
  );
}
