"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConcept,
  deleteConcept,
  getConcept,
  listConcepts,
  updateConcept,
  type ListConceptsParams,
} from "@/features/admin-concepts/api/admin-concepts-client";
import type {
  CreateConceptRequest,
  UpdateConceptRequest,
} from "@/features/admin-concepts/types";
import { adminCurriculumKeys } from "@/features/admin-curriculum/queries";

export const adminConceptKeys = {
  all: ["admin-concepts"] as const,

  lists: () => [...adminConceptKeys.all, "list"] as const,

  list: (params: ListConceptsParams) =>
    [...adminConceptKeys.lists(), params] as const,

  details: () => [...adminConceptKeys.all, "detail"] as const,

  detail: (conceptId: string) =>
    [...adminConceptKeys.details(), conceptId] as const,
};

export function useConcepts(params: ListConceptsParams) {
  return useQuery({
    queryKey: adminConceptKeys.list(params),
    queryFn: () => listConcepts(params),
    staleTime: 30_000,

    placeholderData: (previousData) => previousData,
  });
}

export function useConcept(conceptId: string) {
  return useQuery({
    queryKey: adminConceptKeys.detail(conceptId),
    queryFn: () => getConcept(conceptId),
    enabled: conceptId !== "",
    staleTime: 30_000,
  });
}

export function useCreateConcept(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<CreateConceptRequest, "course_id">) =>
      createConcept({
        ...request,
        course_id: courseId,
      }),

    onSuccess: async () => {
      await Promise.all([
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

export function useUpdateConcept(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conceptId,
      request,
    }: {
      conceptId: string;
      request: UpdateConceptRequest;
    }) => updateConcept(conceptId, request),

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminConceptKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminConceptKeys.detail(variables.conceptId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCurriculumKeys.concepts(courseId),
        }),
      ]);
    },
  });
}

export function useDeleteConcept(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConcept,

    onSuccess: async (_data, conceptId) => {
      queryClient.removeQueries({
        queryKey: adminConceptKeys.detail(conceptId),
      });

      await Promise.all([
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
