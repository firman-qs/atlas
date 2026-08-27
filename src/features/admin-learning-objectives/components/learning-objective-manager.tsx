"use client";

import { useTranslations } from "next-intl";
import { FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateLearningObjectiveForm } from "@/features/admin-learning-objectives/components/create-learning-objective-form";
import { EditLearningObjectiveForm } from "@/features/admin-learning-objectives/components/edit-learning-objective-form";
import {
  useDeleteLearningObjective,
  useLearningObjectives,
} from "@/features/admin-learning-objectives/queries";
import type { AdminLearningObjective } from "@/features/admin-learning-objectives/types";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { SortableLearningObjectiveCard } from "@/features/admin-learning-objectives/components/sortable-learning-objective-card";
import { useReorderLearningObjectives } from "@/features/admin-learning-objectives/queries";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface LearningObjectiveManagerProps {
  courseId: string;
}

function LearningObjectiveManagerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LearningObjectiveManager({
  courseId,
}: LearningObjectiveManagerProps) {
  const t = useTranslations("admin.learningObjectives");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

  const learningObjectivesQuery = useLearningObjectives({
    courseId,
    page: 1,
    pageSize: 100,
  });

  const reorderLearningObjectives = useReorderLearningObjectives({
    courseId,
    page: 1,
    pageSize: 100,
  });

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

  const deleteLearningObjective = useDeleteLearningObjective();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminLearningObjective | null>(null);

  if (learningObjectivesQuery.isPending) {
    return <LearningObjectiveManagerSkeleton />;
  }

  if (learningObjectivesQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {learningObjectivesQuery.error instanceof Error
                ? learningObjectivesQuery.error.message
                : tErrors("loadLearningObjectives")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const learningObjectives = learningObjectivesQuery.data.items;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = learningObjectives.findIndex(
      (learningObjective) => learningObjective.id === active.id,
    );

    const newIndex = learningObjectives.findIndex(
      (learningObjective) => learningObjective.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const orderedItems = arrayMove(learningObjectives, oldIndex, newIndex).map(
      (learningObjective, index) => ({
        ...learningObjective,
        display_order: index + 1,
      }),
    );

    reorderLearningObjectives.mutate({
      orderedIds: orderedItems.map((learningObjective) => learningObjective.id),
      orderedItems,
    });
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteLearningObjective.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Keep dialog open and render mutation error.
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{t("title")}</CardTitle>

            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Button
            onClick={() => setIsCreating((current) => !current)}
            variant={isCreating ? "outline" : "default"}
          >
            <Plus />
            {isCreating ? t("closeForm") : t("newObjective")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isCreating && (
          <CreateLearningObjectiveForm
            courseId={courseId}
            onCancel={() => setIsCreating(false)}
            onCreated={() => setIsCreating(false)}
          />
        )}

        {learningObjectives.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>

            <p className="mt-3 font-medium">{t("noObjectives")}</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("noObjectivesDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reorderLearningObjectives.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {reorderLearningObjectives.error instanceof Error
                    ? reorderLearningObjectives.error.message
                    : tErrors("reorder")}
                </AlertDescription>
              </Alert>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={learningObjectives.map(
                  (learningObjective) => learningObjective.id,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {learningObjectives.map((learningObjective) =>
                    editingId === learningObjective.id ? (
                      <div
                        key={learningObjective.id}
                        className="rounded-lg border bg-background p-4"
                      >
                        <EditLearningObjectiveForm
                          learningObjective={learningObjective}
                          onCancel={() => setEditingId(null)}
                          onSaved={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <SortableLearningObjectiveCard
                        key={learningObjective.id}
                        learningObjective={learningObjective}
                        disabled={
                          reorderLearningObjectives.isPending ||
                          deleteLearningObjective.isPending
                        }
                        onEdit={() => setEditingId(learningObjective.id)}
                        onDelete={() => {
                          deleteLearningObjective.reset();
                          setDeleteTarget(learningObjective);
                        }}
                      />
                    ),
                  )}
                </div>
              </SortableContext>
            </DndContext>

            <p className="text-sm text-muted-foreground">
              {t("count", { count: learningObjectivesQuery.data.total })}
            </p>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteLearningObjective.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {deleteTarget
                ? t("dialog.deleteDescription", {
                    code: deleteTarget.code.toUpperCase(),
                  })
                : t("dialog.deleteTitle")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteLearningObjective.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {deleteLearningObjective.error instanceof Error
                  ? deleteLearningObjective.error.message
                  : tErrors("deleteLearningObjective")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLearningObjective.isPending}>
              {common("cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={deleteLearningObjective.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleteLearningObjective.isPending && (
                <Loader2 className="animate-spin" />
              )}

              {deleteLearningObjective.isPending
                ? t("dialog.deleting")
                : t("dialog.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
