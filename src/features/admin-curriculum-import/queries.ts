"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { adminConceptKeys } from "@/features/admin-concepts/queries";
import { adminCourseKeys } from "@/features/admin-courses/queries";
import { importCurriculum } from "@/features/admin-curriculum-import/api/admin-curriculum-import-client";
import { adminCurriculumKeys } from "@/features/admin-curriculum/queries";
import { adminLearningObjectiveKeys } from "@/features/admin-learning-objectives/queries";

export function useImportCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importCurriculum,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminCourseKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adminConceptKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adminLearningObjectiveKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adminCurriculumKeys.all,
        }),
      ]);
    },
  });
}
