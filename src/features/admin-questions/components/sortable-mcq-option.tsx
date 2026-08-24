"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { AtlasRichTextEditor } from "@/components/rich-text/atlas-rich-text-editor";
import { Button } from "@/components/ui/button";

interface SortableMcqOptionProps {
  id: string;
  label: string;
  value: string;
  isCorrect: boolean;
  disabled?: boolean;
  canRemove: boolean;

  onChange: (value: string) => void;
  onSelectCorrect: () => void;
  onRemove: () => void;
}

export function SortableMcqOption({
  id,
  label,
  value,
  isCorrect,
  disabled = false,
  canRemove,
  onChange,
  onSelectCorrect,
  onRemove,
}: SortableMcqOptionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
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
        isDragging ? "relative z-20 opacity-70 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Reorder option ${label}`}
          disabled={disabled}
          className="cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={onSelectCorrect}
              className="flex items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={[
                  "flex size-4 items-center justify-center rounded-full border",
                  isCorrect ? "border-primary" : "border-muted-foreground/50",
                ].join(" ")}
                aria-hidden="true"
              >
                {isCorrect && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </span>
              Option {label}
              {isCorrect && (
                <span className="text-xs text-muted-foreground">
                  Correct answer
                </span>
              )}
            </button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled || !canRemove}
              onClick={onRemove}
            >
              <Trash2 />
              Remove
            </Button>
          </div>

          <AtlasRichTextEditor
            value={value}
            onChange={onChange}
            mediaPurpose="authoring"
            disabled={disabled}
            placeholder={`Write option ${label}...`}
            className="min-h-24"
          />
        </div>
      </div>
    </div>
  );
}
