"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAssessment,
  createAssessment,
  createLearningRecord,
  getAssessment,
  getAssessmentOptions,
  getAssessmentResult,
  getLearningRecordProgress,
  getNextQuestion,
  getStudentEnrollment,
  getStudentQuestionBanks,
  listAssessments,
  startAssessment,
  submitAttempt,
} from "@/features/student-course/api/student-course-client";

import type {
  ReviewTarget,
  SubmitAttemptRequest,
} from "@/features/student-course/types";

import { studentCourseKeys } from "@/features/student-courses/queries";

export const studentCourseDetailKeys = {
  all: ["student-course"] as const,

  detail: (enrollmentId: string) =>
    [...studentCourseDetailKeys.all, "detail", enrollmentId] as const,

  progress: (learningRecordId: string) =>
    [...studentCourseDetailKeys.all, "progress", learningRecordId] as const,

  assessmentOptions: (learningRecordId: string) =>
    [
      ...studentCourseDetailKeys.all,
      "assessment-options",
      learningRecordId,
    ] as const,

  questionBanks: (learningRecordId: string) =>
    [
      ...studentCourseDetailKeys.all,
      "question-banks",
      learningRecordId,
    ] as const,
};

export const studentAssessmentKeys = {
  all: ["student-assessment"] as const,

  list: (page: number, pageSize: number) =>
    [...studentAssessmentKeys.all, "list", page, pageSize] as const,

  detail: (assessmentId: string) =>
    [...studentAssessmentKeys.all, "detail", assessmentId] as const,

  result: (assessmentId: string) =>
    [...studentAssessmentKeys.all, "result", assessmentId] as const,

  question: (assessmentId: string) =>
    [...studentAssessmentKeys.all, "question", assessmentId] as const,
};

export function useStudentEnrollment(enrollmentId: string) {
  return useQuery({
    queryKey: studentCourseDetailKeys.detail(enrollmentId),
    queryFn: () => getStudentEnrollment(enrollmentId),
    staleTime: 0,
  });
}

export function useCreateLearningRecord(enrollmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createLearningRecord(enrollmentId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.detail(enrollmentId),
          exact: true,
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseKeys.all,
        }),
      ]);

      await queryClient.refetchQueries({
        queryKey: studentCourseDetailKeys.detail(enrollmentId),
        exact: true,
      });
    },
  });
}

export function useLearningRecordProgress(learningRecordId: string) {
  return useQuery({
    queryKey: studentCourseDetailKeys.progress(learningRecordId),
    queryFn: () => getLearningRecordProgress(learningRecordId),
    staleTime: 15_000,
  });
}

export function useAssessmentOptions(learningRecordId: string) {
  return useQuery({
    queryKey: studentCourseDetailKeys.assessmentOptions(learningRecordId),
    queryFn: () => getAssessmentOptions(learningRecordId),
    staleTime: 15_000,
  });
}

export function useCreateProgressAssessment(learningRecordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (learningObjectiveId: string) =>
      createAssessment(learningRecordId, {
        learning_objective_id: learningObjectiveId,
        question_bank_id: null,
        mode: "progress",
        review_target: null,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.assessmentOptions(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.progress(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.all,
        }),
      ]);
    },
  });
}

export function useCreateReviewAssessment(learningRecordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningObjectiveId,
      reviewTarget,
      questionBankId,
    }: {
      learningObjectiveId: string;
      reviewTarget: ReviewTarget;
      questionBankId: string | null;
    }) =>
      createAssessment(learningRecordId, {
        learning_objective_id: learningObjectiveId,
        question_bank_id: questionBankId,
        mode: "review",
        review_target: reviewTarget,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.assessmentOptions(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.progress(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.all,
        }),
      ]);
    },
  });
}

export function useStartAssessment(learningRecordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessmentId: string) => startAssessment(assessmentId),

    onSuccess: async (_, assessmentId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.assessmentOptions(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.progress(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.detail(assessmentId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.all,
        }),
      ]);
    },
  });
}

export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: studentAssessmentKeys.detail(assessmentId),
    queryFn: () => getAssessment(assessmentId),
    staleTime: 0,
    retry: false,
  });
}

export function useIssueNextQuestion(assessmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getNextQuestion(assessmentId),

    onSuccess: (question) => {
      queryClient.setQueryData(
        studentAssessmentKeys.question(assessmentId),
        question,
      );

      void queryClient.invalidateQueries({
        queryKey: studentAssessmentKeys.detail(assessmentId),
      });
    },
  });
}

export function useSubmitAttempt(
  assessmentId: string,
  learningRecordId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitAttemptRequest) =>
      submitAttempt(assessmentId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.detail(assessmentId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.result(assessmentId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.progress(learningRecordId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.assessmentOptions(learningRecordId),
        }),
      ]);
    },
  });
}

export function useCancelAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
    }: {
      assessmentId: string;
      learningRecordId: string;
    }) => cancelAssessment(assessmentId),

    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: studentAssessmentKeys.question(variables.assessmentId),
        exact: true,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.detail(variables.assessmentId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.result(variables.assessmentId),
        }),

        queryClient.invalidateQueries({
          queryKey: studentAssessmentKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.assessmentOptions(
            variables.learningRecordId,
          ),
        }),

        queryClient.invalidateQueries({
          queryKey: studentCourseDetailKeys.progress(
            variables.learningRecordId,
          ),
        }),
      ]);
    },
  });
}

export function useAssessments(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: studentAssessmentKeys.list(page, pageSize),
    queryFn: () => listAssessments(page, pageSize),
    staleTime: 15_000,
  });
}

export function useAssessmentResult(assessmentId: string) {
  return useQuery({
    queryKey: studentAssessmentKeys.result(assessmentId),
    queryFn: () => getAssessmentResult(assessmentId),
    staleTime: 30_000,
    retry: false,
  });
}

export function useStudentQuestionBanks(learningRecordId: string) {
  return useQuery({
    queryKey: studentCourseDetailKeys.questionBanks(learningRecordId),
    queryFn: () => getStudentQuestionBanks(learningRecordId, 1, 100),
    staleTime: 30_000,
  });
}
