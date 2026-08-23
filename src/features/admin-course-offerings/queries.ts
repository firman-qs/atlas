"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminCourseOffering,
  deleteAdminCourseOffering,
  getAdminCourseOffering,
  listAdminCourseOfferings,
  type ListAdminCourseOfferingsParams,
  updateAdminCourseOffering,
} from "@/features/admin-course-offerings/api/admin-course-offerings-client";

import type {
  CreateCourseOfferingRequest,
  UpdateCourseOfferingRequest,
} from "@/features/admin-course-offerings/types";

export const adminCourseOfferingKeys = {
  all: ["admin-course-offerings"] as const,

  lists: () => [...adminCourseOfferingKeys.all, "list"] as const,

  list: (params: ListAdminCourseOfferingsParams) =>
    [...adminCourseOfferingKeys.lists(), params] as const,

  details: () => [...adminCourseOfferingKeys.all, "detail"] as const,

  detail: (courseOfferingId: string) =>
    [...adminCourseOfferingKeys.details(), courseOfferingId] as const,
};

export function useAdminCourseOfferings(
  params: ListAdminCourseOfferingsParams = {},
) {
  return useQuery({
    queryKey: adminCourseOfferingKeys.list(params),
    queryFn: () => listAdminCourseOfferings(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminCourseOffering(courseOfferingId: string) {
  return useQuery({
    queryKey: adminCourseOfferingKeys.detail(courseOfferingId),
    queryFn: () => getAdminCourseOffering(courseOfferingId),
    enabled: courseOfferingId !== "",
    staleTime: 30_000,
  });
}

export function useCreateAdminCourseOffering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCourseOfferingRequest) =>
      createAdminCourseOffering(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCourseOfferingKeys.lists(),
      });
    },
  });
}

export function useUpdateAdminCourseOffering(courseOfferingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCourseOfferingRequest) =>
      updateAdminCourseOffering(courseOfferingId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminCourseOfferingKeys.detail(courseOfferingId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCourseOfferingKeys.lists(),
        }),
      ]);
    },
  });
}

export function useDeleteAdminCourseOffering(courseOfferingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAdminCourseOffering(courseOfferingId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCourseOfferingKeys.lists(),
      });
    },
  });
}
