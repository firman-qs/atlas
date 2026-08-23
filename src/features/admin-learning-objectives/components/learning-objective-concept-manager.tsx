"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/features/admin-concepts/queries";
import type { AdminConcept } from "@/features/admin-concepts/types";
import { SortableLearningObjectiveConcept } from "@/features/admin-learning-objectives/components/sortable-learning-objective-concept";
import {
  useAttachConceptToLearningObjective,
  useDetachConceptFromLearningObjective,
  useLearningObjectiveConcepts,
  useReorderLearningObjectiveConcepts,
  useUpdateLearningObjectiveConceptSettings,
} from "@/features/admin-learning-objectives/concepts-queries";
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
import { BookOpenText, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface LearningObjectiveConceptManagerProps {
  learningObjectiveId: string;
  courseId: string;
}

export function LearningObjectiveConceptManager({
  learningObjectiveId,
  courseId,
}: LearningObjectiveConceptManagerProps) {
  const [showAttachBrowser, setShowAttachBrowser] = useState(false);
  const [detachTarget, setDetachTarget] = useState<AdminConcept | null>(null);

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

  const attachedQuery = useLearningObjectiveConcepts(learningObjectiveId);

  const conceptsQuery = useConcepts({
    courseId,
    page: 1,
    pageSize: 100,
  });

  const attachConcept = useAttachConceptToLearningObjective(
    learningObjectiveId,
    courseId,
  );

  const detachConcept = useDetachConceptFromLearningObjective(
    learningObjectiveId,
    courseId,
  );

  const updateSettings =
    useUpdateLearningObjectiveConceptSettings(learningObjectiveId);

  const reorderConcepts =
    useReorderLearningObjectiveConcepts(learningObjectiveId);

  const attachedIds = useMemo(
    () =>
      new Set(attachedQuery.data?.items.map((item) => item.concept.id) ?? []),
    [attachedQuery.data?.items],
  );

  const availableConcepts =
    conceptsQuery.data?.items.filter(
      (concept) => !attachedIds.has(concept.id),
    ) ?? [];

  if (attachedQuery.isPending) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/10 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (attachedQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {attachedQuery.error instanceof Error
            ? attachedQuery.error.message
            : "Unable to load attached concepts."}
        </AlertDescription>
      </Alert>
    );
  }

  const attached = attachedQuery.data.items;
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = attached.findIndex(
      (item) => `loc:${item.id}` === active.id,
    );

    const newIndex = attached.findIndex((item) => `loc:${item.id}` === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const orderedItems = arrayMove(attached, oldIndex, newIndex);

    reorderConcepts.mutate({
      orderedItems,
      orderedConceptIds: orderedItems.map((item) => item.concept.id),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpenText className="size-4" />

          <p className="font-medium">Concepts</p>

          <Badge variant="outline">{attached.length}</Badge>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={reorderConcepts.isPending}
          onClick={() => setShowAttachBrowser((current) => !current)}
        >
          <Plus />
          {showAttachBrowser ? "Close" : "Attach concept"}
        </Button>
      </div>

      {attachConcept.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {attachConcept.error instanceof Error
              ? attachConcept.error.message
              : "Unable to attach concept."}
          </AlertDescription>
        </Alert>
      )}

      {updateSettings.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateSettings.error instanceof Error
              ? updateSettings.error.message
              : "Unable to update concept settings."}
          </AlertDescription>
        </Alert>
      )}

      {detachConcept.isError && !detachTarget && (
        <Alert variant="destructive">
          <AlertDescription>
            {detachConcept.error instanceof Error
              ? detachConcept.error.message
              : "Unable to detach concept."}
          </AlertDescription>
        </Alert>
      )}

      {reorderConcepts.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {reorderConcepts.error instanceof Error
              ? reorderConcepts.error.message
              : "Unable to reorder concepts."}
          </AlertDescription>
        </Alert>
      )}

      {attached.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center">
          <p className="text-sm font-medium">No concepts attached</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Attach a course concept to define the learning objective structure.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={attached.map((item) => `loc:${item.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {attached.map((item) => (
                <SortableLearningObjectiveConcept
                  key={item.id}
                  item={item}
                  disabled={
                    reorderConcepts.isPending ||
                    attachConcept.isPending ||
                    detachConcept.isPending
                  }
                  isSettingsPending={updateSettings.isPending}
                  settingsPendingConceptId={updateSettings.variables?.conceptId}
                  onToggleRequired={() =>
                    updateSettings.mutate({
                      conceptId: item.concept.id,
                      isRequired: !item.is_required,
                    })
                  }
                  onDetach={() => {
                    detachConcept.reset();
                    setDetachTarget(item.concept);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAttachBrowser && (
        <div className="space-y-3 rounded-md border bg-background p-3">
          <div>
            <p className="text-sm font-medium">Available course concepts</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Only concepts not already attached to this learning objective are
              shown.
            </p>
          </div>

          {conceptsQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : conceptsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {conceptsQuery.error instanceof Error
                  ? conceptsQuery.error.message
                  : "Unable to load course concepts."}
              </AlertDescription>
            </Alert>
          ) : availableConcepts.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center">
              <p className="text-sm font-medium">No concepts available</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Every course concept is already attached to this learning
                objective.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableConcepts.map((concept) => (
                <div
                  key={concept.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{concept.code}</Badge>

                      <p className="text-sm font-medium">{concept.name}</p>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {concept.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    disabled={attachConcept.isPending}
                    onClick={() => {
                      const isLastAvailableConcept =
                        availableConcepts.length === 1;

                      attachConcept.mutate(concept.id, {
                        onSuccess: () => {
                          if (isLastAvailableConcept) {
                            setShowAttachBrowser(false);
                          }
                        },
                      });
                    }}
                  >
                    {attachConcept.isPending &&
                    attachConcept.variables === concept.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Plus />
                    )}
                    Attach
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog
        open={detachTarget !== null}
        onOpenChange={(open) => {
          if (!open && !detachConcept.isPending) {
            setDetachTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detach concept?</AlertDialogTitle>

            <AlertDialogDescription>
              {detachTarget
                ? `Detach ${detachTarget.code} — ${detachTarget.name} from this learning objective? The course-level concept itself will not be deleted.`
                : "Detach this concept from the learning objective?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {detachConcept.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {detachConcept.error instanceof Error
                  ? detachConcept.error.message
                  : "Unable to detach concept."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={detachConcept.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={detachConcept.isPending}
              onClick={(event) => {
                event.preventDefault();

                if (!detachTarget) {
                  return;
                }

                void detachConcept
                  .mutateAsync(detachTarget.id)
                  .then(() => {
                    setDetachTarget(null);
                  })
                  .catch(() => {
                    // Dialog stays open and renders the mutation error.
                  });
              }}
            >
              {detachConcept.isPending && <Loader2 className="animate-spin" />}

              {detachConcept.isPending ? "Detaching..." : "Detach concept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
