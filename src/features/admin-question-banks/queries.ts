"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  attachQuestionToBank,
  createQuestionBank,
  deleteQuestionBank,
  detachQuestionFromBank,
  getQuestionBank,
  listAdminQuestions,
  listQuestionBankQuestions,
  listQuestionBanks,
  updateQuestionBank,
  type ListAdminQuestionsParams,
  type ListQuestionBankQuestionsParams,
  type ListQuestionBanksParams,
} from "@/features/admin-question-banks/api/admin-question-banks-client";

import type { UpdateQuestionBankRequest } from "@/features/admin-question-banks/types";

export const adminQuestionBankKeys = {
  all: ["admin-question-banks"] as const,

  lists: () => [...adminQuestionBankKeys.all, "list"] as const,

  list: (params: ListQuestionBanksParams) =>
    [...adminQuestionBankKeys.lists(), params] as const,

  details: () => [...adminQuestionBankKeys.all, "detail"] as const,

  detail: (questionBankId: string) =>
    [...adminQuestionBankKeys.details(), questionBankId] as const,

  questionLists: (questionBankId: string) =>
    [...adminQuestionBankKeys.detail(questionBankId), "questions"] as const,

  questionList: (
    questionBankId: string,
    params: ListQuestionBankQuestionsParams,
  ) =>
    [...adminQuestionBankKeys.questionLists(questionBankId), params] as const,

  adminQuestionLists: () =>
    [...adminQuestionBankKeys.all, "admin-questions"] as const,

  adminQuestionList: (params: ListAdminQuestionsParams) =>
    [...adminQuestionBankKeys.adminQuestionLists(), params] as const,
};

export function useQuestionBanks(params: ListQuestionBanksParams = {}) {
  return useQuery({
    queryKey: adminQuestionBankKeys.list(params),
    queryFn: () => listQuestionBanks(params),
    staleTime: 30_000,
  });
}

export function useCreateQuestionBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestionBank,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQuestionBankKeys.lists(),
      });
    },
  });
}

export function useQuestionBank(questionBankId: string) {
  return useQuery({
    queryKey: adminQuestionBankKeys.detail(questionBankId),
    queryFn: () => getQuestionBank(questionBankId),
    staleTime: 30_000,
  });
}

export function useQuestionBankQuestions(
  questionBankId: string,
  params: ListQuestionBankQuestionsParams = {},
) {
  return useQuery({
    queryKey: adminQuestionBankKeys.questionList(questionBankId, params),
    queryFn: () => listQuestionBankQuestions(questionBankId, params),
    staleTime: 30_000,
  });
}

export function useDetachQuestionFromBank(questionBankId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      detachQuestionFromBank(questionBankId, questionId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQuestionBankKeys.questionLists(questionBankId),
      });
    },
  });
}

export function useAttachQuestionToBank(questionBankId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      attachQuestionToBank(questionBankId, questionId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminQuestionBankKeys.questionLists(questionBankId),
        }),

        queryClient.invalidateQueries({
          queryKey: adminQuestionBankKeys.adminQuestionLists(),
        }),
      ]);
    },
  });
}

export function useUpdateQuestionBank(questionBankId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateQuestionBankRequest) =>
      updateQuestionBank(questionBankId, request),

    onSuccess: async (updatedBank) => {
      queryClient.setQueryData(
        adminQuestionBankKeys.detail(questionBankId),
        updatedBank,
      );

      await queryClient.invalidateQueries({
        queryKey: adminQuestionBankKeys.lists(),
      });
    },
  });
}

export function useDeleteQuestionBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionBankId: string) => deleteQuestionBank(questionBankId),

    onSuccess: async (_, questionBankId) => {
      queryClient.removeQueries({
        queryKey: adminQuestionBankKeys.detail(questionBankId),
      });

      await queryClient.invalidateQueries({
        queryKey: adminQuestionBankKeys.lists(),
      });
    },
  });
}

export function useAdminQuestions(params: ListAdminQuestionsParams) {
  return useQuery({
    queryKey: adminQuestionBankKeys.adminQuestionList(params),
    queryFn: () => listAdminQuestions(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
