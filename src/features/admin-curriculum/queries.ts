"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listAdminConcepts,
  listAdminLearningObjectives,
  listAdminSoloLevels,
} from "@/features/admin-curriculum/api/admin-curriculum-client";

export const adminCurriculumKeys = {
  all: ["admin-curriculum"] as const,

  learningObjectives: (courseId: string) =>
    [...adminCurriculumKeys.all, "learning-objectives", courseId] as const,

  concepts: (courseId: string) =>
    [...adminCurriculumKeys.all, "concepts", courseId] as const,

  soloLevels: () => [...adminCurriculumKeys.all, "solo-levels"] as const,
};

export function useAdminLearningObjectives(courseId: string) {
  return useQuery({
    queryKey: adminCurriculumKeys.learningObjectives(courseId),
    queryFn: () => listAdminLearningObjectives(courseId),
    staleTime: 60_000,
  });
}

export function useAdminConcepts(courseId: string) {
  return useQuery({
    queryKey: adminCurriculumKeys.concepts(courseId),
    queryFn: () => listAdminConcepts(courseId),
    staleTime: 60_000,
  });
}

export function useAdminSoloLevels() {
  return useQuery({
    queryKey: adminCurriculumKeys.soloLevels(),
    queryFn: listAdminSoloLevels,
    staleTime: 60_000,
  });
}
