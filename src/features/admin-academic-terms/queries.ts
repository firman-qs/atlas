"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminAcademicTerm,
  deleteAdminAcademicTerm,
  getAdminAcademicTerm,
  listAdminAcademicTerms,
  type ListAdminAcademicTermsParams,
  updateAdminAcademicTerm,
} from "@/features/admin-academic-terms/api/admin-academic-terms-client";

import type {
  CreateAcademicTermRequest,
  UpdateAcademicTermRequest,
} from "@/features/admin-academic-terms/types";

export const adminAcademicTermKeys = {
  all: ["admin-academic-terms"] as const,

  lists: () => [...adminAcademicTermKeys.all, "list"] as const,

  list: (params: ListAdminAcademicTermsParams) =>
    [...adminAcademicTermKeys.lists(), params] as const,

  details: () => [...adminAcademicTermKeys.all, "detail"] as const,

  detail: (academicTermId: string) =>
    [...adminAcademicTermKeys.details(), academicTermId] as const,
};

export function useAdminAcademicTerms(
  params: ListAdminAcademicTermsParams = {},
) {
  return useQuery({
    queryKey: adminAcademicTermKeys.list(params),
    queryFn: () => listAdminAcademicTerms(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminAcademicTerm(academicTermId: string) {
  return useQuery({
    queryKey: adminAcademicTermKeys.detail(academicTermId),
    queryFn: () => getAdminAcademicTerm(academicTermId),
    enabled: academicTermId !== "",
    staleTime: 30_000,
  });
}

export function useCreateAdminAcademicTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAcademicTermRequest) =>
      createAdminAcademicTerm(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminAcademicTermKeys.lists(),
      });
    },
  });
}

export function useUpdateAdminAcademicTerm(academicTermId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateAcademicTermRequest) =>
      updateAdminAcademicTerm(academicTermId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminAcademicTermKeys.detail(academicTermId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminAcademicTermKeys.lists(),
        }),
      ]);
    },
  });
}

export function useDeleteAdminAcademicTerm(academicTermId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAdminAcademicTerm(academicTermId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminAcademicTermKeys.detail(academicTermId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminAcademicTermKeys.lists(),
        }),
      ]);
    },
  });
}
