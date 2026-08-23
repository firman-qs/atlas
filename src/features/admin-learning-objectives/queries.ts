"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLearningObjective,
  deleteLearningObjective,
  listLearningObjectives,
  reorderLearningObjectives,
  updateLearningObjective,
  type ListLearningObjectivesParams,
} from "@/features/admin-learning-objectives/api/admin-learning-objectives-client";
import type {
  AdminLearningObjective,
  CreateLearningObjectiveRequest,
  UpdateLearningObjectiveRequest,
} from "@/features/admin-learning-objectives/types";
import type { PaginatedView } from "@/lib/api/types";

export const adminLearningObjectiveKeys = {
  all: ["admin-learning-objectives"] as const,

  lists: () => [...adminLearningObjectiveKeys.all, "list"] as const,

  list: (params: ListLearningObjectivesParams) =>
    [...adminLearningObjectiveKeys.lists(), params] as const,
};

export function useLearningObjectives(params: ListLearningObjectivesParams) {
  return useQuery({
    queryKey: adminLearningObjectiveKeys.list(params),
    queryFn: () => listLearningObjectives(params),
    enabled: params.courseId !== "",
    staleTime: 30_000,
  });
}

export function useCreateLearningObjective(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<CreateLearningObjectiveRequest, "course_id">) =>
      createLearningObjective({
        ...request,
        course_id: courseId,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminLearningObjectiveKeys.lists(),
      });
    },
  });
}

export function useUpdateLearningObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningObjectiveId,
      request,
    }: {
      learningObjectiveId: string;
      request: UpdateLearningObjectiveRequest;
    }) => updateLearningObjective(learningObjectiveId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminLearningObjectiveKeys.lists(),
      });
    },
  });
}

export function useDeleteLearningObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLearningObjective,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminLearningObjectiveKeys.lists(),
      });
    },
  });
}

interface ReorderVariables {
  orderedIds: string[];
  orderedItems: AdminLearningObjective[];
}

export function useReorderLearningObjectives(
  params: ListLearningObjectivesParams,
) {
  const queryClient = useQueryClient();

  const queryKey = adminLearningObjectiveKeys.list(params);

  return useMutation({
    mutationFn: ({ orderedIds }: ReorderVariables) =>
      reorderLearningObjectives(params.courseId, {
        learning_objective_ids: orderedIds,
      }),

    onMutate: async ({ orderedItems }) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previous =
        queryClient.getQueryData<PaginatedView<AdminLearningObjective>>(
          queryKey,
        );

      if (previous) {
        queryClient.setQueryData<PaginatedView<AdminLearningObjective>>(
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
