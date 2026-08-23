"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { importQuestions } from "@/features/admin-question-import/api/admin-question-import-client";
import { adminQuestionKeys } from "@/features/admin-questions/queries";

export function useImportQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importQuestions,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQuestionKeys.all,
      });
    },
  });
}
