import { useTranslations } from "next-intl";
import { Check, Circle, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDomainCode,
  soloLevelMessageKey,
} from "@/features/student-course/labels";
import type {
  InstructorLearningObjectiveConceptProgress,
  InstructorLearningRecordProgress,
} from "@/features/instructor-learning-records/types";
import { cn } from "@/lib/utils";

interface InstructorLearningProgressProps {
  progress: InstructorLearningRecordProgress;
}

function masteredLevelIndex(
  concept: InstructorLearningObjectiveConceptProgress,
) {
  if (!concept.mastered_loc_level_id) {
    return -1;
  }

  return concept.levels.findIndex(
    (level) => level.loc_level_id === concept.mastered_loc_level_id,
  );
}

export function InstructorLearningProgress({
  progress,
}: InstructorLearningProgressProps) {
  const t = useTranslations("instructor.learningRecords");
  const tSolo = useTranslations("course.soloLevels");

  function formatSoloLabel(code: string) {
    const key = soloLevelMessageKey(code);
    if (
      key === "unistructural" ||
      key === "multistructural" ||
      key === "relational" ||
      key === "extendedAbstract" ||
      key === "prestructural"
    ) {
      return tSolo(key);
    }
    return formatDomainCode(code);
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>{t("progress.title")}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {t("progress.description")}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {progress.learning_objectives.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">{t("progress.noCurriculum")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("progress.noCurriculumDescription")}
            </p>
          </div>
        ) : (
          progress.learning_objectives.map((lo) => (
            <section key={lo.id} className="rounded-lg border p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{lo.code.toUpperCase()}</Badge>

                    {lo.mastered_at && (
                      <Badge>
                        <Trophy className="size-3" />
                        {t("progress.mastered")}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {lo.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {lo.concepts.map((concept) => {
                  const masteredIndex = masteredLevelIndex(concept);

                  return (
                    <div
                      key={concept.learning_objective_concept_id}
                      className="rounded-md bg-muted/40 p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {concept.concept.name}
                            </p>

                            <Badge variant="secondary" className="font-mono">
                              {concept.concept.code}
                            </Badge>

                            {!concept.is_required && (
                              <Badge variant="outline">{t("progress.optional")}</Badge>
                            )}

                            {concept.mastered_at && (
                              <Badge>
                                <Check className="size-3" />
                                {t("progress.conceptMastered")}
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {concept.concept.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {concept.levels.map((level, index) => {
                          const mastered = index <= masteredIndex;

                          return (
                            <div
                              key={level.loc_level_id}
                              className={cn(
                                "flex items-start gap-3 rounded-md border bg-background p-3",
                                mastered && "border-foreground/20",
                              )}
                            >
                              <div className="mt-0.5">
                                {mastered ? (
                                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="size-3" />
                                  </span>
                                ) : (
                                  <Circle className="size-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <p className="text-sm font-medium">
                                  {formatSoloLabel(level.solo_level.code)}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {level.solo_level.description}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {t("progress.masteryThreshold", {
                                    percent: Math.round(level.mastery_threshold * 100),
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
}
