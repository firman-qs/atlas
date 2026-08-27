"use client";

import { useTranslations } from "next-intl";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SortableMcqOption } from "@/features/admin-questions/components/sortable-mcq-option";
import type { QuestionAuthoringFormValues } from "@/features/admin-questions/schemas";

interface McqQuestionFieldsProps {
  control: Control<QuestionAuthoringFormValues>;
  setValue: UseFormSetValue<QuestionAuthoringFormValues>;
  errors: FieldErrors<QuestionAuthoringFormValues>;
  disabled?: boolean;
}

function createClientId() {
  return crypto.randomUUID();
}

function optionLabel(index: number) {
  let value = index;
  let label = "";

  do {
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

export function McqQuestionFields({
  control,
  setValue,
  errors,
  disabled = false,
}: McqQuestionFieldsProps) {
  const t = useTranslations("admin.questions.form");

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "options",
    keyName: "fieldId",
  });

  const options =
    useWatch({
      control,
      name: "options",
    }) ?? [];

  const correctOptionId =
    useWatch({
      control,
      name: "correctOptionId",
    }) ?? "";

  const isOptionShuffled =
    useWatch({
      control,
      name: "isOptionShuffled",
    }) ?? false;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.clientId === active.id);

    const newIndex = fields.findIndex((field) => field.clientId === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    move(oldIndex, newIndex);
  }

  function handleRemove(index: number, clientId: string) {
    if (fields.length <= 2) {
      return;
    }

    if (correctOptionId === clientId) {
      setValue("correctOptionId", "", {
        shouldValidate: true,
      });
    }

    remove(index);
  }

  function handleAddOption() {
    append({
      clientId: createClientId(),
      text: "",
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <Label>{t("optionsLabel")}</Label>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("optionsDescription")}
        </p>
      </div>

      {typeof errors.options?.message === "string" && (
        <Alert variant="destructive">
          <AlertDescription>{errors.options.message}</AlertDescription>
        </Alert>
      )}

      {errors.correctOptionId && (
        <Alert variant="destructive">
          <AlertDescription>{errors.correctOptionId.message}</AlertDescription>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.clientId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {fields.map((field, index) => {
              const option = options[index];

              return (
                <div key={field.fieldId}>
                  <SortableMcqOption
                    id={field.clientId}
                    label={optionLabel(index)}
                    value={option?.text ?? ""}
                    isCorrect={correctOptionId === field.clientId}
                    disabled={disabled}
                    canRemove={fields.length > 2}
                    onSelectCorrect={() =>
                      setValue("correctOptionId", field.clientId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    onChange={(text) =>
                      setValue(`options.${index}.text`, text, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    onRemove={() => handleRemove(index, field.clientId)}
                  />

                  {errors.options?.[index]?.text && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.options[index]?.text?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={handleAddOption}
      >
        <Plus />
        {t("addOption")}
      </Button>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="shuffle-mcq-options">{t("shuffleOptions")}</Label>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("shuffleDescription")}
          </p>
        </div>

        <Switch
          id="shuffle-mcq-options"
          checked={isOptionShuffled}
          disabled={disabled}
          onCheckedChange={(checked) =>
            setValue("isOptionShuffled", checked, {
              shouldDirty: true,
            })
          }
        />
      </div>
    </div>
  );
}
