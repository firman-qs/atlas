"use client";

import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Link2, Loader2, Unlink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningObjectiveConceptLevelManager } from "@/features/admin-learning-objectives/components/learning-objective-concept-level-manager";
import type { AdminLearningObjectiveConcept } from "@/features/admin-learning-objectives/concepts-types";

interface SortableLearningObjectiveConceptProps {
  item: AdminLearningObjectiveConcept;
  disabled?: boolean;

  isSettingsPending: boolean;
  settingsPendingConceptId?: string;

  onToggleRequired: () => void;
  onDetach: () => void;
}

export function SortableLearningObjectiveConcept({
  item,
  disabled = false,
  isSettingsPending,
  settingsPendingConceptId,
  onToggleRequired,
  onDetach,
}: SortableLearningObjectiveConceptProps) {
  const t = useTranslations("admin.learningObjectives.concepts");
  const tLO = useTranslations("admin.learningObjectives");

  const sortableId = `loc:${item.id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thisSettingsPending =
    isSettingsPending && settingsPendingConceptId === item.concept.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-md border bg-background p-3",
        isDragging ? "relative z-20 opacity-70 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={tLO("reorderAria", { code: item.concept.code })}
            disabled={disabled}
            className="cursor-grab touch-none active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{tLO("order", { order: item.display_order })}</Badge>

              <Badge variant="outline">{item.concept.code}</Badge>

              <p className="text-sm font-medium">{item.concept.name}</p>

              <Badge variant={item.is_required ? "default" : "secondary"}>
                {item.is_required ? t("required") : t("optional")}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {item.concept.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || isSettingsPending}
            onClick={onToggleRequired}
          >
            {thisSettingsPending ? (
              <Loader2 className="animate-spin" />
            ) : item.is_required ? (
              <Check />
            ) : (
              <Link2 />
            )}

            {item.is_required ? t("makeOptional") : t("makeRequired")}
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={onDetach}
          >
            <Unlink />
            {t("detach")}
          </Button>
        </div>
      </div>

      <LearningObjectiveConceptLevelManager
        learningObjectiveId={item.learning_objective_id}
        conceptId={item.concept.id}
      />
    </div>
  );
}
