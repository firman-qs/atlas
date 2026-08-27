"use client";

import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminLearningObjectiveConceptLevel } from "@/features/admin-learning-objectives/levels-types";

interface SortableLearningObjectiveConceptLevelProps {
  item: AdminLearningObjectiveConceptLevel;
  disabled?: boolean;

  isUpdatePending: boolean;
  updatePendingSoloLevelId?: string;

  onEdit: () => void;
  onRemove: () => void;
}

export function SortableLearningObjectiveConceptLevel({
  item,
  disabled = false,
  isUpdatePending,
  updatePendingSoloLevelId,
  onEdit,
  onRemove,
}: SortableLearningObjectiveConceptLevelProps) {
  const t = useTranslations("admin.learningObjectives.soloLevels");
  const tLO = useTranslations("admin.learningObjectives");

  const sortableId = `loc-level:${item.id}`;

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

  const thisUpdatePending =
    isUpdatePending && updatePendingSoloLevelId === item.solo_level.id;

  const thresholdPercent = Math.round(item.mastery_threshold * 100);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-md border bg-background p-3",
        isDragging ? "relative z-30 opacity-70 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={tLO("reorderAria", { code: item.solo_level.code })}
            disabled={disabled}
            className="cursor-grab touch-none active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{tLO("order", { order: item.display_order })}</Badge>

              <Badge variant="outline">{item.solo_level.code}</Badge>

              <Badge variant="secondary">{t("soloBadge", { level: item.solo_level.level })}</Badge>

              <Badge>{t("masteryBadge", { percent: thresholdPercent })}</Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              {item.solo_level.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || isUpdatePending}
            onClick={onEdit}
          >
            {thisUpdatePending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Pencil />
            )}
            {t("editThreshold")}
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 />
            {t("remove")}
          </Button>
        </div>
      </div>
    </div>
  );
}
