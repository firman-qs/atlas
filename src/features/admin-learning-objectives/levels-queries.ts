"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addLearningObjectiveConceptLevel,
  listLearningObjectiveConceptLevels,
  removeLearningObjectiveConceptLevel,
  reorderLearningObjectiveConceptLevels,
  updateLearningObjectiveConceptLevel,
} from "@/features/admin-learning-objectives/api/admin-learning-objective-concepts-client";
import type { AdminLearningObjectiveConceptLevel } from "@/features/admin-learning-objectives/levels-types";

export const adminLearningObjectiveConceptLevelKeys = {
  all: ["admin-learning-objective-concept-levels"] as const,

  lists: () => [...adminLearningObjectiveConceptLevelKeys.all, "list"] as const,

  list: (learningObjectiveId: string, conceptId: string) =>
    [
      ...adminLearningObjectiveConceptLevelKeys.lists(),
      learningObjectiveId,
      conceptId,
    ] as const,
};

export function useLearningObjectiveConceptLevels(
  learningObjectiveId: string,
  conceptId: string,
) {
  return useQuery({
    queryKey: adminLearningObjectiveConceptLevelKeys.list(
      learningObjectiveId,
      conceptId,
    ),
    queryFn: () =>
      listLearningObjectiveConceptLevels(learningObjectiveId, conceptId),
    staleTime: 30_000,
  });
}

export function useAddLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveConceptLevelKeys.list(
    learningObjectiveId,
    conceptId,
  );

  return useMutation({
    mutationFn: ({
      soloLevelId,
      masteryThreshold,
    }: {
      soloLevelId: string;
      masteryThreshold: number;
    }) =>
      addLearningObjectiveConceptLevel(learningObjectiveId, conceptId, {
        solo_level_id: soloLevelId,
        mastery_threshold: masteryThreshold,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}

export function useUpdateLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveConceptLevelKeys.list(
    learningObjectiveId,
    conceptId,
  );

  return useMutation({
    mutationFn: ({
      soloLevelId,
      masteryThreshold,
    }: {
      soloLevelId: string;
      masteryThreshold: number;
    }) =>
      updateLearningObjectiveConceptLevel(
        learningObjectiveId,
        conceptId,
        soloLevelId,
        {
          mastery_threshold: masteryThreshold,
        },
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}

export function useRemoveLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveConceptLevelKeys.list(
    learningObjectiveId,
    conceptId,
  );

  return useMutation({
    mutationFn: (soloLevelId: string) =>
      removeLearningObjectiveConceptLevel(
        learningObjectiveId,
        conceptId,
        soloLevelId,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}

interface ReorderLevelVariables {
  orderedItems: AdminLearningObjectiveConceptLevel[];
  orderedSoloLevelIds: string[];
}

export function useReorderLearningObjectiveConceptLevels(
  learningObjectiveId: string,
  conceptId: string,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveConceptLevelKeys.list(
    learningObjectiveId,
    conceptId,
  );

  return useMutation({
    mutationFn: ({ orderedSoloLevelIds }: ReorderLevelVariables) =>
      reorderLearningObjectiveConceptLevels(learningObjectiveId, conceptId, {
        solo_level_ids: orderedSoloLevelIds,
      }),

    onMutate: async ({ orderedItems }) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previous =
        queryClient.getQueryData<AdminLearningObjectiveConceptLevel[]>(
          queryKey,
        );

      if (previous) {
        queryClient.setQueryData<AdminLearningObjectiveConceptLevel[]>(
          queryKey,
          orderedItems.map((item, index) => ({
            ...item,
            display_order: index + 1,
          })),
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
