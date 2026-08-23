"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activateAdminCourse,
  createAdminCourse,
  deactivateAdminCourse,
  deleteAdminCourse,
  getAdminCourse,
  listAdminCourses,
  updateAdminCourse,
  type ListAdminCoursesParams,
} from "@/features/admin-courses/api/admin-courses-client";

import type { UpdateCourseRequest } from "@/features/admin-courses/types";

export const adminCourseKeys = {
  all: ["admin-courses"] as const,

  lists: () => [...adminCourseKeys.all, "list"] as const,

  list: (params: ListAdminCoursesParams) =>
    [...adminCourseKeys.lists(), params] as const,

  details: () => [...adminCourseKeys.all, "detail"] as const,

  detail: (courseId: string) =>
    [...adminCourseKeys.details(), courseId] as const,
};

export function useAdminCourses(params: ListAdminCoursesParams = {}) {
  return useQuery({
    queryKey: adminCourseKeys.list(params),
    queryFn: () => listAdminCourses(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCourse,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminCourseKeys.lists(),
      });
    },
  });
}

export function useAdminCourse(courseId: string) {
  return useQuery({
    queryKey: adminCourseKeys.detail(courseId),
    queryFn: () => getAdminCourse(courseId),
    enabled: courseId !== "",
    staleTime: 30_000,
  });
}

export function useUpdateAdminCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCourseRequest) =>
      updateAdminCourse(courseId, request),

    onSuccess: async (course) => {
      queryClient.setQueryData(adminCourseKeys.detail(courseId), course);

      await queryClient.invalidateQueries({
        queryKey: adminCourseKeys.lists(),
      });
    },
  });
}
export function useActivateAdminCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activateAdminCourse(courseId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminCourseKeys.detail(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCourseKeys.lists(),
        }),
      ]);
    },
  });
}

export function useDeactivateAdminCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deactivateAdminCourse(courseId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminCourseKeys.detail(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminCourseKeys.lists(),
        }),
      ]);
    },
  });
}
export function useDeleteAdminCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAdminCourse(courseId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: adminCourseKeys.detail(courseId),
      });

      await queryClient.invalidateQueries({
        queryKey: adminCourseKeys.lists(),
      });
    },
  });
}
