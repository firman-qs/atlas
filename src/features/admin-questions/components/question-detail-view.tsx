import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionContentDetail } from "@/features/admin-questions/components/question-content-detail";
import type { AdminQuestionSummary } from "@/features/admin-questions/types";

interface QuestionDetailViewProps {
  question: AdminQuestionSummary;

  courseCode?: string;
  learningObjectiveCode?: string;
  conceptCode?: string;
  conceptName?: string;
  soloLevelCode?: string;
}

export function QuestionDetailView({
  question,
  courseCode,
  learningObjectiveCode,
  conceptCode,
  conceptName,
  soloLevelCode,
}: QuestionDetailViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {question.question_type === "mcq" ? "MCQ" : "Essay"}
            </Badge>

            <Badge
              variant={question.status === "published" ? "default" : "outline"}
            >
              {question.status === "published" ? "Published" : "Draft"}
            </Badge>

            {courseCode && (
              <Badge variant="outline">{courseCode.toUpperCase()}</Badge>
            )}

            {learningObjectiveCode && (
              <Badge variant="outline">
                {learningObjectiveCode.toUpperCase()}
              </Badge>
            )}

            {conceptCode && <Badge variant="outline">{conceptCode}</Badge>}

            {conceptName && <Badge variant="outline">{conceptName}</Badge>}

            {soloLevelCode && (
              <Badge variant="outline" className="capitalize">
                {soloLevelCode}
              </Badge>
            )}
          </div>

          <CardTitle className="mt-3">Question</CardTitle>
        </CardHeader>

        <CardContent>
          <AtlasRichTextViewer
            value={question.prompt}
            className="text-base leading-7"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Content</CardTitle>
        </CardHeader>

        <CardContent>
          <QuestionContentDetail question={question} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>

        <CardContent>
          {question.feedback ? (
            <AtlasRichTextViewer value={question.feedback} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No feedback provided.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI guidelines</CardTitle>
        </CardHeader>

        <CardContent>
          {question.ai_guidelines ? (
            <p className="whitespace-pre-wrap text-sm leading-6">
              {question.ai_guidelines}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No AI guidelines provided.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
