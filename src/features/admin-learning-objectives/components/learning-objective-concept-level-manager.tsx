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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Layers3, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSoloLevels } from "@/features/admin-curriculum/queries";
import { SortableLearningObjectiveConceptLevel } from "@/features/admin-learning-objectives/components/sortable-learning-objective-concept-level";
import {
  useAddLearningObjectiveConceptLevel,
  useLearningObjectiveConceptLevels,
  useRemoveLearningObjectiveConceptLevel,
  useReorderLearningObjectiveConceptLevels,
  useUpdateLearningObjectiveConceptLevel,
} from "@/features/admin-learning-objectives/levels-queries";
import type { AdminLearningObjectiveConceptLevel } from "@/features/admin-learning-objectives/levels-types";

interface LearningObjectiveConceptLevelManagerProps {
  learningObjectiveId: string;
  conceptId: string;
}

export function LearningObjectiveConceptLevelManager({
  learningObjectiveId,
  conceptId,
}: LearningObjectiveConceptLevelManagerProps) {
  const t = useTranslations("admin.learningObjectives.soloLevels");
  const tLO = useTranslations("admin.learningObjectives");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const [showAddBrowser, setShowAddBrowser] = useState(false);

  const [addThreshold, setAddThreshold] = useState(0.8);

  const [editingLevel, setEditingLevel] =
    useState<AdminLearningObjectiveConceptLevel | null>(null);

  const [editingThreshold, setEditingThreshold] = useState(0.8);

  const [removeTarget, setRemoveTarget] =
    useState<AdminLearningObjectiveConceptLevel | null>(null);

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

  const levelsQuery = useLearningObjectiveConceptLevels(
    learningObjectiveId,
    conceptId,
  );

  const soloLevelsQuery = useAdminSoloLevels();

  const addLevel = useAddLearningObjectiveConceptLevel(
    learningObjectiveId,
    conceptId,
  );

  const updateLevel = useUpdateLearningObjectiveConceptLevel(
    learningObjectiveId,
    conceptId,
  );

  const removeLevel = useRemoveLearningObjectiveConceptLevel(
    learningObjectiveId,
    conceptId,
  );

  const reorderLevels = useReorderLearningObjectiveConceptLevels(
    learningObjectiveId,
    conceptId,
  );

  const configuredSoloIds = useMemo(
    () => new Set(levelsQuery.data?.map((item) => item.solo_level.id) ?? []),
    [levelsQuery.data],
  );

  const availableSoloLevels =
    soloLevelsQuery.data?.filter((level) => !configuredSoloIds.has(level.id)) ??
    [];

  if (levelsQuery.isPending) {
    return (
      <div className="mt-4 space-y-2 border-t pt-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (levelsQuery.isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>
          {levelsQuery.error instanceof Error
            ? levelsQuery.error.message
            : tErrors("addSoloLevel")}
        </AlertDescription>
      </Alert>
    );
  }

  const levels = levelsQuery.data;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = levels.findIndex(
      (item) => `loc-level:${item.id}` === active.id,
    );

    const newIndex = levels.findIndex(
      (item) => `loc-level:${item.id}` === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const orderedItems = arrayMove(levels, oldIndex, newIndex);

    reorderLevels.mutate({
      orderedItems,
      orderedSoloLevelIds: orderedItems.map((item) => item.solo_level.id),
    });
  }

  const mutationPending =
    addLevel.isPending ||
    updateLevel.isPending ||
    removeLevel.isPending ||
    reorderLevels.isPending;

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers3 className="size-4" />

          <p className="text-sm font-medium">{t("title")}</p>

          <Badge variant="outline">{levels.length}</Badge>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mutationPending}
          onClick={() => setShowAddBrowser((current) => !current)}
        >
          <Plus />
          {showAddBrowser ? t("closeForm") : t("addLevel")}
        </Button>
      </div>

      {addLevel.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {addLevel.error instanceof Error
              ? addLevel.error.message
              : tErrors("addSoloLevel")}
          </AlertDescription>
        </Alert>
      )}

      {updateLevel.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateLevel.error instanceof Error
              ? updateLevel.error.message
              : tErrors("addSoloLevel")}
          </AlertDescription>
        </Alert>
      )}

      {removeLevel.isError && !removeTarget && (
        <Alert variant="destructive">
          <AlertDescription>
            {removeLevel.error instanceof Error
              ? removeLevel.error.message
              : tErrors("removeSoloLevel")}
          </AlertDescription>
        </Alert>
      )}

      {reorderLevels.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {reorderLevels.error instanceof Error
              ? reorderLevels.error.message
              : tErrors("reorder")}
          </AlertDescription>
        </Alert>
      )}

      {levels.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center">
          <p className="text-sm font-medium">{t("noLevels")}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("noLevelsDescription")}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={levels.map((item) => `loc-level:${item.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {levels.map((item) => (
                <SortableLearningObjectiveConceptLevel
                  key={item.id}
                  item={item}
                  disabled={mutationPending}
                  isUpdatePending={updateLevel.isPending}
                  updatePendingSoloLevelId={updateLevel.variables?.soloLevelId}
                  onEdit={() => {
                    updateLevel.reset();
                    setEditingLevel(item);
                    setEditingThreshold(item.mastery_threshold);
                  }}
                  onRemove={() => {
                    removeLevel.reset();
                    setRemoveTarget(item);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAddBrowser && (
        <div className="space-y-3 rounded-md border bg-muted/20 p-3">
          <div>
            <p className="text-sm font-medium">{t("availableTitle")}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              {t("availableDescription")}
            </p>
          </div>

          <div className="max-w-48 space-y-2">
            <Label htmlFor={`add-threshold-${conceptId}`}>
              {t("threshold")}
            </Label>

            <Input
              id={`add-threshold-${conceptId}`}
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={addThreshold}
              disabled={addLevel.isPending}
              onChange={(event) => setAddThreshold(Number(event.target.value))}
            />

            <p className="text-xs text-muted-foreground">
              {t("thresholdHint")}
            </p>
          </div>

          {soloLevelsQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : soloLevelsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {soloLevelsQuery.error instanceof Error
                  ? soloLevelsQuery.error.message
                  : tErrors("addSoloLevel")}
              </AlertDescription>
            </Alert>
          ) : availableSoloLevels.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center">
              <p className="text-sm font-medium">{t("noLevelsAvailable")}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {t("noLevelsAvailableDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSoloLevels.map((level) => (
                <div
                  key={level.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{level.code}</Badge>

                      <Badge variant="secondary">{t("soloBadge", { level: level.level })}</Badge>
                    </div>

                    <AtlasRichTextViewer
                      value={level.description}
                      className="mt-1 text-xs text-muted-foreground"
                    />
                  </div>

                  <Button
                    size="sm"
                    disabled={
                      addLevel.isPending ||
                      !Number.isFinite(addThreshold) ||
                      addThreshold < 0 ||
                      addThreshold > 1
                    }
                    onClick={() => {
                      const isLastAvailable = availableSoloLevels.length === 1;

                      addLevel.mutate(
                        {
                          soloLevelId: level.id,
                          masteryThreshold: addThreshold,
                        },
                        {
                          onSuccess: () => {
                            if (isLastAvailable) {
                              setShowAddBrowser(false);
                            }
                          },
                        },
                      );
                    }}
                  >
                    {addLevel.isPending &&
                    addLevel.variables?.soloLevelId === level.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plus />
                    )}
                    {tLO("actions.create")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog
        open={editingLevel !== null}
        onOpenChange={(open) => {
          if (!open && !updateLevel.isPending) {
            setEditingLevel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tLO("dialog.editThresholdTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {editingLevel
                ? tLO("dialog.editThresholdDescription", {
                    code: editingLevel.solo_level.code,
                  })
                : tLO("dialog.editThresholdTitle")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {updateLevel.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {updateLevel.error instanceof Error
                  ? updateLevel.error.message
                  : tErrors("addSoloLevel")}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor={`edit-threshold-${conceptId}`}>
              {t("threshold")}
            </Label>

            <Input
              id={`edit-threshold-${conceptId}`}
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={editingThreshold}
              disabled={updateLevel.isPending}
              onChange={(event) =>
                setEditingThreshold(Number(event.target.value))
              }
            />

            <p className="text-xs text-muted-foreground">
              {t("thresholdCurrentPercent", {
                percent: Number.isFinite(editingThreshold)
                  ? Math.round(editingThreshold * 100)
                  : 0,
              })}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateLevel.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                updateLevel.isPending ||
                !editingLevel ||
                !Number.isFinite(editingThreshold) ||
                editingThreshold < 0 ||
                editingThreshold > 1
              }
              onClick={(event) => {
                event.preventDefault();

                if (!editingLevel) {
                  return;
                }

                void updateLevel
                  .mutateAsync({
                    soloLevelId: editingLevel.solo_level.id,
                    masteryThreshold: editingThreshold,
                  })
                  .then(() => {
                    setEditingLevel(null);
                  })
                  .catch(() => {
                    // Keep dialog open to show API error.
                  });
              }}
            >
              {updateLevel.isPending && <Loader2 className="animate-spin" />}

              {updateLevel.isPending ? tLO("actions.saving") : t("saveThreshold")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !removeLevel.isPending) {
            setRemoveTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tLO("dialog.deleteLevelTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {removeTarget
                ? tLO("dialog.deleteLevelDescription", {
                    code: removeTarget.solo_level.code,
                  })
                : tLO("dialog.deleteLevelTitle")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {removeLevel.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {removeLevel.error instanceof Error
                  ? removeLevel.error.message
                  : tErrors("removeSoloLevel")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLevel.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={removeLevel.isPending}
              onClick={(event) => {
                event.preventDefault();

                if (!removeTarget) {
                  return;
                }

                void removeLevel
                  .mutateAsync(removeTarget.solo_level.id)
                  .then(() => {
                    setRemoveTarget(null);
                  })
                  .catch(() => {
                    // Dialog remains open and shows backend error.
                  });
              }}
            >
              {removeLevel.isPending && <Loader2 className="animate-spin" />}

              {removeLevel.isPending ? tLO("dialog.removing") : tLO("dialog.confirmRemove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
