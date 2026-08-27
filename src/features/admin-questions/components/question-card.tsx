import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.questions");

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
          {t("open")}
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
              {t("optionCount", { count: question.content.options.length })}
            </span>

            <span>
              {question.content.is_option_shuffled
                ? t("optionsShuffled")
                : t("fixedOptionOrder")}
            </span>
          </>
        ) : (
          <span>{t("essayResponse")}</span>
        )}

        <span className="font-mono" title={question.id}>
          {question.id.slice(0, 8)}…
        </span>
      </div>
    </div>
  );
}
