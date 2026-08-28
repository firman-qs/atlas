import { Check, Circle, Trophy } from "lucide-react";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatDomainCode,
  learningObjectiveNumber,
  soloLevelMessageKey,
} from "@/features/student-course/labels";
import type {
  LearningObjectiveConceptProgress,
  LearningRecordProgress,
} from "@/features/student-course/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LearningProgressProps {
  progress: LearningRecordProgress;
}

function masteredLevelIndex(concept: LearningObjectiveConceptProgress) {
  if (!concept.mastered_loc_level_id) {
    return -1;
  }

  return concept.levels.findIndex(
    (level) => level.loc_level_id === concept.mastered_loc_level_id,
  );
}

function percentage(mastered: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return (mastered / total) * 100;
}

function MasterySummary({
  label,
  mastered,
  total,
  testId,
}: {
  label: string;
  mastered: number;
  total: number;
  testId: string;
}) {
  const messages = useTranslations("course.progress");

  return (
    <div data-testid={testId} className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className="text-sm font-medium tabular-nums">
          {messages("masteredCount", { mastered, total })}
        </p>
      </div>

      <Progress value={percentage(mastered, total)} />
    </div>
  );
}

function ConceptProgress({
  concept,
}: {
  concept: LearningObjectiveConceptProgress;
}) {
  const messages = useTranslations("course.progress");
  const course = useTranslations("course");
  const masteredIndex = masteredLevelIndex(concept);
  const masteredLevels = masteredIndex + 1;
  const totalLevels = concept.levels.length;

  return (
    <div
      data-testid="concept-progress"
      className="rounded-xl border bg-background/60 p-4 sm:p-5"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{concept.concept.name}</p>

            <Badge variant="secondary" className="font-mono">
              {concept.concept.code}
            </Badge>

            {!concept.is_required && (
              <Badge variant="outline">{messages("optional")}</Badge>
            )}

            {concept.mastered_at && (
              <Badge>
                <Check className="size-3" />
                {messages("conceptMastered")}
              </Badge>
            )}
          </div>

          <AtlasRichTextViewer
            value={concept.concept.description}
            className="mt-1 text-sm leading-6 text-muted-foreground"
          />
        </div>

        <p className="shrink-0 text-sm font-medium tabular-nums">
          {messages("levelsMastered", {
            mastered: masteredLevels,
            total: totalLevels,
          })}
        </p>
      </div>

      {totalLevels > 0 && (
        <div className="mt-5">
          <div className="relative">
            {totalLevels > 1 && (
              <div
                aria-hidden="true"
                className="absolute top-3 right-[10%] left-[10%] h-px bg-border"
              />
            )}

            <div
              className="relative grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${totalLevels}, minmax(0, 1fr))`,
              }}
            >
              {concept.levels.map((level, index) => {
                const mastered = index <= masteredIndex;
                const soloKey = soloLevelMessageKey(level.solo_level.code);

                return (
                  <div
                    key={level.loc_level_id}
                    data-testid={`solo-level-${level.loc_level_id}`}
                    data-mastered={mastered ? "true" : "false"}
                    className="min-w-0"
                  >
                    <div className="flex justify-center">
                      {mastered ? (
                        <span className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                          <Check className="size-3.5" />
                        </span>
                      ) : (
                        <span className="relative z-10 flex size-6 items-center justify-center rounded-full bg-background ring-4 ring-background">
                          <Circle className="size-6 text-muted-foreground" />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-center">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !mastered && "text-muted-foreground",
                        )}
                      >
                        {soloKey
                          ? course(`soloLevels.${soloKey}`)
                          : formatDomainCode(level.solo_level.code)}
                      </p>

                      <AtlasRichTextViewer
                        value={level.solo_level.description}
                        className="mt-1 text-xs leading-5 text-muted-foreground"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LearningProgress({ progress }: LearningProgressProps) {
  const messages = useTranslations("course.progress");
  const learningObjectives = progress.learning_objectives;

  function objectiveLabel(code: string, displayOrder?: number | null) {
    const number = learningObjectiveNumber(code, displayOrder);

    return number === null
      ? messages("learningObjective")
      : messages("learningObjectiveNumbered", { number });
  }

  const masteredLearningObjectives = learningObjectives.filter(
    (learningObjective) => learningObjective.mastered_at !== null,
  ).length;

  const requiredConcepts = learningObjectives.flatMap((learningObjective) =>
    learningObjective.concepts.filter((concept) => concept.is_required),
  );

  const masteredRequiredConcepts = requiredConcepts.filter(
    (concept) => concept.mastered_at !== null,
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>{messages("title")}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {messages("description")}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="rounded-xl bg-muted/30 p-4 sm:p-5">
          <div>
            <p className="font-medium">{messages("courseMastery")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {messages("courseMasteryDescription")}
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 md:divide-x">
            <div className="md:pr-5">
              <MasterySummary
                label={messages("learningObjectives")}
                mastered={masteredLearningObjectives}
                total={learningObjectives.length}
                testId="learning-objective-summary"
              />
            </div>

            <div className="md:pl-5">
              <MasterySummary
                label={messages("requiredConcepts")}
                mastered={masteredRequiredConcepts}
                total={requiredConcepts.length}
                testId="required-concept-summary"
              />
            </div>
          </div>
        </section>

        <div className="divide-y">
          {learningObjectives.map((lo) => (
            <section key={lo.id} className="py-6 first:pt-0 last:pb-0">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {objectiveLabel(lo.code, lo.display_order)}
                  </Badge>

                  {lo.mastered_at && (
                    <Badge>
                      <Trophy className="size-3" />
                      {messages("mastered")}
                    </Badge>
                  )}
                </div>

                <AtlasRichTextViewer
                  value={lo.description}
                  className="text-sm leading-6 text-muted-foreground"
                />
              </div>

              <div className="mt-4 space-y-3">
                {lo.concepts.map((concept) => (
                  <ConceptProgress
                    key={concept.learning_objective_concept_id}
                    concept={concept}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
