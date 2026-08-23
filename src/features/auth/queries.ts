"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authClient from "@/features/auth/api/auth-client";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/features/auth/types";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: authClient.getSession,
    staleTime: 30_000,
    retry: false,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => authClient.register(request),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => authClient.login(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) =>
      authClient.changePassword(request),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) =>
      authClient.forgotPassword(request),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) =>
      authClient.resetPassword(request),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authClient.logout,

    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);

      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
    },
  });
}
