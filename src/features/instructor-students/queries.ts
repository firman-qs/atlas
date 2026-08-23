"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listInstructorStudents,
  type ListInstructorStudentsParams,
} from "@/features/instructor-students/api/instructor-students-client";

export const instructorStudentKeys = {
  all: ["instructor-students"] as const,

  lists: () => [...instructorStudentKeys.all, "list"] as const,

  list: (params: ListInstructorStudentsParams) =>
    [...instructorStudentKeys.lists(), params] as const,
};

export function useInstructorStudents(
  params: ListInstructorStudentsParams = {},
) {
  return useQuery({
    queryKey: instructorStudentKeys.list(params),
    queryFn: () => listInstructorStudents(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
