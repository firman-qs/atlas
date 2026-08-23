"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listStudentCourses,
  type ListStudentCoursesParams,
} from "@/features/student-courses/api/student-courses-client";

export const studentCourseKeys = {
  all: ["student-courses"] as const,

  lists: () => [...studentCourseKeys.all, "list"] as const,

  list: (params: ListStudentCoursesParams) =>
    [...studentCourseKeys.lists(), params] as const,
};

export function useStudentCourses(params: ListStudentCoursesParams = {}) {
  return useQuery({
    queryKey: studentCourseKeys.list(params),
    queryFn: () => listStudentCourses(params),
    staleTime: 30_000,
  });
}
