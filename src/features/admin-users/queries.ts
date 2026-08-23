"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  assignAdminUserRole,
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  removeAdminUserRole,
  type ListAdminUsersParams,
} from "@/features/admin-users/api/admin-users-client";

import type { AdminUserRole } from "@/features/admin-users/types";

export const adminUserKeys = {
  all: ["admin-users"] as const,

  lists: () => [...adminUserKeys.all, "list"] as const,

  list: (params: ListAdminUsersParams) =>
    [...adminUserKeys.lists(), params] as const,

  details: () => [...adminUserKeys.all, "detail"] as const,

  detail: (userId: string) => [...adminUserKeys.details(), userId] as const,
};

export function useAdminUsers(params: ListAdminUsersParams = {}) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => listAdminUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => getAdminUser(userId),
    enabled: userId !== "",
    staleTime: 30_000,
  });
}

export function useAssignAdminUserRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: AdminUserRole) => assignAdminUserRole(userId, role),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.detail(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.lists(),
        }),
      ]);
    },
  });
}

export function useRemoveAdminUserRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: AdminUserRole) => removeAdminUserRole(userId, role),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.detail(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.lists(),
        }),
      ]);
    },
  });
}

export function useDeleteAdminUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAdminUser(userId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.detail(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: adminUserKeys.lists(),
        }),
      ]);
    },
  });
}
