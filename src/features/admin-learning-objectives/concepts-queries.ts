"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminConceptKeys } from "@/features/admin-concepts/queries";
import { adminCurriculumKeys } from "@/features/admin-curriculum/queries";
import {
  attachConceptToLearningObjective,
  detachConceptFromLearningObjective,
  listLearningObjectiveConcepts,
  reorderLearningObjectiveConcepts,
  updateLearningObjectiveConceptSettings,
} from "@/features/admin-learning-objectives/api/admin-learning-objective-concepts-client";
import type { AdminLearningObjectiveConcept } from "@/features/admin-learning-objectives/concepts-types";
import type { PaginatedView } from "@/lib/api/types";

export const adminLearningObjectiveConceptKeys = {
  all: ["admin-learning-objective-concepts"] as const,

  lists: () => [...adminLearningObjectiveConceptKeys.all, "list"] as const,

  list: (learningObjectiveId: string) =>
    [
      ...adminLearningObjectiveConceptKeys.lists(),
      learningObjectiveId,
    ] as const,
};

export function useLearningObjectiveConcepts(learningObjectiveId: string) {
  return useQuery({
    queryKey: adminLearningObjectiveConceptKeys.list(learningObjectiveId),
    queryFn: () => listLearningObjectiveConcepts(learningObjectiveId),
    staleTime: 30_000,
  });
}

export function useAttachConceptToLearningObjective(
  learningObjectiveId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conceptId: string) =>
      attachConceptToLearningObjective(learningObjectiveId, conceptId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminLearningObjectiveConceptKeys.list(learningObjectiveId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminConceptKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCurriculumKeys.concepts(courseId),
        }),
      ]);
    },
  });
}

export function useUpdateLearningObjectiveConceptSettings(
  learningObjectiveId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conceptId,
      isRequired,
    }: {
      conceptId: string;
      isRequired: boolean;
    }) =>
      updateLearningObjectiveConceptSettings(learningObjectiveId, conceptId, {
        is_required: isRequired,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminLearningObjectiveConceptKeys.list(learningObjectiveId),
      });
    },
  });
}

export function useDetachConceptFromLearningObjective(
  learningObjectiveId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conceptId: string) =>
      detachConceptFromLearningObjective(learningObjectiveId, conceptId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminLearningObjectiveConceptKeys.list(learningObjectiveId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminConceptKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCurriculumKeys.concepts(courseId),
        }),
      ]);
    },
  });
}

interface ReorderConceptVariables {
  orderedConceptIds: string[];
  orderedItems: AdminLearningObjectiveConcept[];
}

export function useReorderLearningObjectiveConcepts(
  learningObjectiveId: string,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveConceptKeys.list(learningObjectiveId);

  return useMutation({
    mutationFn: ({ orderedConceptIds }: ReorderConceptVariables) =>
      reorderLearningObjectiveConcepts(learningObjectiveId, {
        concept_ids: orderedConceptIds,
      }),

    onMutate: async ({ orderedItems }) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previous =
        queryClient.getQueryData<PaginatedView<AdminLearningObjectiveConcept>>(
          queryKey,
        );

      if (previous) {
        queryClient.setQueryData<PaginatedView<AdminLearningObjectiveConcept>>(
          queryKey,
          {
            ...previous,
            items: orderedItems.map((item, index) => ({
              ...item,
              display_order: index + 1,
            })),
          },
        );
      }

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}
