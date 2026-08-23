"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestion,
  listAdminQuestions,
  publishAdminQuestion,
  unpublishAdminQuestion,
  updateAdminQuestion,
  type ListAdminQuestionsParams,
} from "@/features/admin-questions/api/admin-questions-client";

import type {
  CreateAdminQuestionRequest,
  UpdateAdminQuestionRequest,
} from "@/features/admin-questions/types";

export const adminQuestionKeys = {
  all: ["admin-questions"] as const,

  lists: () => [...adminQuestionKeys.all, "list"] as const,

  list: (params: ListAdminQuestionsParams) =>
    [...adminQuestionKeys.lists(), params] as const,

  details: () => [...adminQuestionKeys.all, "detail"] as const,

  detail: (questionId: string) =>
    [...adminQuestionKeys.details(), questionId] as const,
};

export function useAdminQuestions(params: ListAdminQuestionsParams = {}) {
  return useQuery({
    queryKey: adminQuestionKeys.list(params),
    queryFn: () => listAdminQuestions(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdminQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAdminQuestionRequest) =>
      createAdminQuestion(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.lists(),
      });
    },
  });
}

export function useAdminQuestion(questionId: string) {
  return useQuery({
    queryKey: adminQuestionKeys.detail(questionId),
    queryFn: () => getAdminQuestion(questionId),
    enabled: questionId !== "",
    staleTime: 30_000,
  });
}

export function useUpdateAdminQuestion(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateAdminQuestionRequest) =>
      updateAdminQuestion(questionId, request),

    onSuccess: async (question) => {
      queryClient.setQueryData(adminQuestionKeys.detail(questionId), question);

      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.lists(),
      });
    },
  });
}

export function usePublishAdminQuestion(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishAdminQuestion(questionId),

    onSuccess: async (question) => {
      queryClient.setQueryData(adminQuestionKeys.detail(questionId), question);

      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.lists(),
      });
    },
  });
}

export function useUnpublishAdminQuestion(questionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unpublishAdminQuestion(questionId),

    onSuccess: async (question) => {
      queryClient.setQueryData(adminQuestionKeys.detail(questionId), question);

      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.lists(),
      });
    },
  });
}

export function useDeleteAdminQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteAdminQuestion(questionId),

    onSuccess: async (_data, questionId) => {
      queryClient.removeQueries({
        queryKey: adminQuestionKeys.detail(questionId),
      });

      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.lists(),
      });
    },
  });
}
