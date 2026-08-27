import { useTranslations } from "next-intl";
import { CheckCircle2, Shuffle } from "lucide-react";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

interface QuestionContentDetailProps {
  question: AdminQuestionSummary;
}

export function QuestionContentDetail({
  question,
}: QuestionContentDetailProps) {
  const t = useTranslations("admin.questions.detail");

  if (question.content.type === "mcq") {
    const options = [...question.content.options].sort(
      (left, right) => left.display_order - right.display_order,
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium">{t("mcqTitle")}</p>

          {question.content.is_option_shuffled && (
            <Badge variant="outline">
              <Shuffle />
              {t("optionsShuffled")}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </div>

              <div className="min-w-0 flex-1">
                <AtlasRichTextViewer value={option.text} />
              </div>

              {option.is_correct && (
                <Badge>
                  <CheckCircle2 />
                  {t("correct")}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-medium">{t("rubric")}</p>

        <div className="rounded-lg border bg-muted/10 p-4">
          <AtlasRichTextViewer value={question.content.rubric} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-medium">{t("idealAnswer")}</p>

        <div className="rounded-lg border bg-muted/10 p-4">
          <AtlasRichTextViewer value={question.content.ideal_answer} />
        </div>
      </div>
    </div>
  );
}
