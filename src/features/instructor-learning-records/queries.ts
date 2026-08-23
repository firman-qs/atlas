"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getInstructorAssessmentResult,
  getInstructorLearningRecord,
  getInstructorLearningRecordProgress,
  listInstructorLearningRecordAssessments,
  type ListInstructorLearningRecordAssessmentsParams,
} from "@/features/instructor-learning-records/api/instructor-learning-records-client";

export const instructorLearningRecordKeys = {
  all: ["instructor-learning-records"] as const,

  detail: (courseOfferingId: string, learningRecordId: string) =>
    [
      ...instructorLearningRecordKeys.all,
      "detail",
      courseOfferingId,
      learningRecordId,
    ] as const,

  progress: (courseOfferingId: string, learningRecordId: string) =>
    [
      ...instructorLearningRecordKeys.all,
      "progress",
      courseOfferingId,
      learningRecordId,
    ] as const,

  assessments: (
    courseOfferingId: string,
    learningRecordId: string,
    params: ListInstructorLearningRecordAssessmentsParams,
  ) =>
    [
      ...instructorLearningRecordKeys.all,
      "assessments",
      courseOfferingId,
      learningRecordId,
      params,
    ] as const,

  assessmentResult: (courseOfferingId: string, assessmentId: string) =>
    [
      ...instructorLearningRecordKeys.all,
      "assessment-result",
      courseOfferingId,
      assessmentId,
    ] as const,
};

export function useInstructorLearningRecord(
  courseOfferingId: string,
  learningRecordId: string,
) {
  return useQuery({
    queryKey: instructorLearningRecordKeys.detail(
      courseOfferingId,
      learningRecordId,
    ),
    queryFn: () =>
      getInstructorLearningRecord(courseOfferingId, learningRecordId),
    enabled: courseOfferingId !== "" && learningRecordId !== "",
    staleTime: 30_000,
  });
}

export function useInstructorLearningRecordProgress(
  courseOfferingId: string,
  learningRecordId: string,
) {
  return useQuery({
    queryKey: instructorLearningRecordKeys.progress(
      courseOfferingId,
      learningRecordId,
    ),
    queryFn: () =>
      getInstructorLearningRecordProgress(courseOfferingId, learningRecordId),
    enabled: courseOfferingId !== "" && learningRecordId !== "",
    staleTime: 15_000,
  });
}

export function useInstructorLearningRecordAssessments(
  courseOfferingId: string,
  learningRecordId: string,
  params: ListInstructorLearningRecordAssessmentsParams = {},
) {
  return useQuery({
    queryKey: instructorLearningRecordKeys.assessments(
      courseOfferingId,
      learningRecordId,
      params,
    ),
    queryFn: () =>
      listInstructorLearningRecordAssessments(
        courseOfferingId,
        learningRecordId,
        params,
      ),
    enabled: courseOfferingId !== "" && learningRecordId !== "",
    staleTime: 15_000,
  });
}

export function useInstructorAssessmentResult(
  courseOfferingId: string,
  assessmentId: string,
) {
  return useQuery({
    queryKey: instructorLearningRecordKeys.assessmentResult(
      courseOfferingId,
      assessmentId,
    ),
    queryFn: () =>
      getInstructorAssessmentResult(courseOfferingId, assessmentId),
    enabled: courseOfferingId !== "" && assessmentId !== "",
    staleTime: 30_000,
    retry: false,
  });
}
