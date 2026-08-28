"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.learningObjectives.concepts");
  const tLO = useTranslations("admin.learningObjectives");
  const tErrors = useTranslations("admin.errors");
  const common = useTranslations("common");

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
            : tErrors("loadConcepts")}
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

          <p className="font-medium">{t("title")}</p>

          <Badge variant="outline">{attached.length}</Badge>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={reorderConcepts.isPending}
          onClick={() => setShowAttachBrowser((current) => !current)}
        >
          <Plus />
          {showAttachBrowser ? t("closeForm") : t("attachTitle")}
        </Button>
      </div>

      {attachConcept.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {attachConcept.error instanceof Error
              ? attachConcept.error.message
              : tErrors("attachConcept")}
          </AlertDescription>
        </Alert>
      )}

      {updateSettings.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updateSettings.error instanceof Error
              ? updateSettings.error.message
              : tErrors("attachConcept")}
          </AlertDescription>
        </Alert>
      )}

      {detachConcept.isError && !detachTarget && (
        <Alert variant="destructive">
          <AlertDescription>
            {detachConcept.error instanceof Error
              ? detachConcept.error.message
              : tErrors("detachConcept")}
          </AlertDescription>
        </Alert>
      )}

      {reorderConcepts.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {reorderConcepts.error instanceof Error
              ? reorderConcepts.error.message
              : tErrors("reorder")}
          </AlertDescription>
        </Alert>
      )}

      {attached.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center">
          <p className="text-sm font-medium">{t("noConcepts")}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("noConceptsDescription")}
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
            <p className="text-sm font-medium">{t("availableTitle")}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              {t("availableDescription")}
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
                  : tErrors("loadConcepts")}
              </AlertDescription>
            </Alert>
          ) : availableConcepts.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center">
              <p className="text-sm font-medium">{t("noConceptsAvailable")}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {t("noConceptsAvailableDescription")}
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

                    <AtlasRichTextViewer
                      value={concept.description}
                      className="mt-1 text-xs text-muted-foreground"
                    />
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
                    {t("attach")}
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
            <AlertDialogTitle>{tLO("dialog.detachTitle")}</AlertDialogTitle>

            <AlertDialogDescription>
              {detachTarget
                ? tLO("dialog.detachDescription", {
                    code: detachTarget.code,
                    name: detachTarget.name,
                  })
                : tLO("dialog.detachTitle")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {detachConcept.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {detachConcept.error instanceof Error
                  ? detachConcept.error.message
                  : tErrors("detachConcept")}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={detachConcept.isPending}>
              {common("cancel")}
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

              {detachConcept.isPending
                ? tLO("dialog.detaching")
                : tLO("dialog.confirmDetach")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
