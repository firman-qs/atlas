"use client";

import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningObjectiveConceptManager } from "@/features/admin-learning-objectives/components/learning-objective-concept-manager";
import type { AdminLearningObjective } from "@/features/admin-learning-objectives/types";

interface SortableLearningObjectiveCardProps {
  learningObjective: AdminLearningObjective;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableLearningObjectiveCard({
  learningObjective,
  disabled = false,
  onEdit,
  onDelete,
}: SortableLearningObjectiveCardProps) {
  const t = useTranslations("admin.learningObjectives");
  const common = useTranslations("common");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: learningObjective.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-lg border bg-background p-4",
        isDragging ? "relative z-10 opacity-70 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("reorderAria", { code: learningObjective.code })}
            disabled={disabled}
            className="cursor-grab touch-none active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {learningObjective.code.toUpperCase()}
              </Badge>

              <Badge variant="secondary">
                {t("order", { order: learningObjective.display_order })}
              </Badge>
            </div>

            <AtlasRichTextViewer
              value={learningObjective.description}
              className="text-sm leading-6 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={disabled}
          >
            <Pencil />
            {common("edit")}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={disabled}
          >
            <Trash2 />
            {common("delete")}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <LearningObjectiveConceptManager
          learningObjectiveId={learningObjective.id}
          courseId={learningObjective.course_id}
        />
      </div>
    </div>
  );
}
