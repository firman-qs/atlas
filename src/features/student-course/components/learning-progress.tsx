import { Check, Circle, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { learningObjectiveLabel } from "@/features/student-course/labels";
import type {
  LearningObjectiveConceptProgress,
  LearningRecordProgress,
} from "@/features/student-course/types";
import { cn } from "@/lib/utils";

interface LearningProgressProps {
  progress: LearningRecordProgress;
}

function formatSoloCode(code: string) {
  return code
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function masteredLevelIndex(concept: LearningObjectiveConceptProgress) {
  if (!concept.mastered_loc_level_id) {
    return -1;
  }

  return concept.levels.findIndex(
    (level) => level.loc_level_id === concept.mastered_loc_level_id,
  );
}

export function LearningProgress({ progress }: LearningProgressProps) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Learning Progress</CardTitle>

          <p className="text-sm text-muted-foreground">
            Concept mastery across the configured learning objectives and SOLO
            levels.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="divide-y">
          {progress.learning_objectives.map((lo) => (
            <section key={lo.id} className="py-6 first:pt-0 last:pb-0">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {learningObjectiveLabel(lo.code, lo.display_order)}
                  </Badge>

                  {lo.mastered_at && (
                    <Badge>
                      <Trophy className="size-3" />
                      Mastered
                    </Badge>
                  )}
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {lo.description}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {lo.concepts.map((concept) => {
                  const masteredIndex = masteredLevelIndex(concept);

                  return (
                    <div
                      key={concept.learning_objective_concept_id}
                      className="rounded-lg bg-muted/35 p-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{concept.concept.name}</p>

                          <Badge variant="secondary" className="font-mono">
                            {concept.concept.code}
                          </Badge>

                          {!concept.is_required && (
                            <Badge variant="outline">Optional</Badge>
                          )}

                          {concept.mastered_at && (
                            <Badge>
                              <Check className="size-3" />
                              Concept mastered
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {concept.concept.description}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {concept.levels.map((level, index) => {
                          const mastered = index <= masteredIndex;

                          return (
                            <div
                              key={level.loc_level_id}
                              className={cn(
                                "flex min-w-0 items-start gap-3 rounded-lg border bg-background/80 p-3",
                                mastered && "border-primary/25 bg-primary/3",
                              )}
                            >
                              <div className="mt-0.5 shrink-0">
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
                                  {formatSoloCode(level.solo_level.code)}
                                </p>

                                <p className="text-xs leading-5 text-muted-foreground">
                                  {level.solo_level.description}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
