"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInstructorEnrollment,
  deleteInstructorEnrollment,
  getInstructorCourseOffering,
  listInstructorCourseOfferingEnrollments,
  listInstructorCourseOfferings,
  type ListInstructorCourseOfferingEnrollmentsParams,
  type ListInstructorCourseOfferingsParams,
} from "@/features/instructor-course-offerings/api/instructor-course-offerings-client";
import { CreateInstructorEnrollmentRequest } from "./types";

export const instructorCourseOfferingKeys = {
  all: ["instructor-course-offerings"] as const,

  lists: () => [...instructorCourseOfferingKeys.all, "list"] as const,

  list: (params: ListInstructorCourseOfferingsParams) =>
    [...instructorCourseOfferingKeys.lists(), params] as const,

  details: () => [...instructorCourseOfferingKeys.all, "detail"] as const,

  detail: (courseOfferingId: string) =>
    [...instructorCourseOfferingKeys.details(), courseOfferingId] as const,

  enrollmentLists: (courseOfferingId: string) =>
    [
      ...instructorCourseOfferingKeys.detail(courseOfferingId),
      "enrollments",
    ] as const,

  enrollmentList: (
    courseOfferingId: string,
    params: ListInstructorCourseOfferingEnrollmentsParams,
  ) =>
    [
      ...instructorCourseOfferingKeys.enrollmentLists(courseOfferingId),
      params,
    ] as const,
};

export function useInstructorCourseOfferings(
  params: ListInstructorCourseOfferingsParams = {},
) {
  return useQuery({
    queryKey: instructorCourseOfferingKeys.list(params),
    queryFn: () => listInstructorCourseOfferings(params),
    staleTime: 30_000,
  });
}

export function useInstructorCourseOffering(courseOfferingId: string) {
  return useQuery({
    queryKey: instructorCourseOfferingKeys.detail(courseOfferingId),
    queryFn: () => getInstructorCourseOffering(courseOfferingId),
    enabled: courseOfferingId !== "",
    staleTime: 30_000,
  });
}

export function useInstructorCourseOfferingEnrollments(
  courseOfferingId: string,
  params: ListInstructorCourseOfferingEnrollmentsParams = {},
) {
  return useQuery({
    queryKey: instructorCourseOfferingKeys.enrollmentList(
      courseOfferingId,
      params,
    ),
    queryFn: () =>
      listInstructorCourseOfferingEnrollments(courseOfferingId, params),
    enabled: courseOfferingId !== "",
    staleTime: 30_000,
  });
}

export function useCreateInstructorEnrollment(courseOfferingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInstructorEnrollmentRequest) =>
      createInstructorEnrollment(courseOfferingId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          instructorCourseOfferingKeys.enrollmentLists(courseOfferingId),
      });
    },
  });
}

export function useDeleteInstructorEnrollment(courseOfferingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      deleteInstructorEnrollment(courseOfferingId, enrollmentId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          instructorCourseOfferingKeys.enrollmentLists(courseOfferingId),
      });
    },
  });
}
