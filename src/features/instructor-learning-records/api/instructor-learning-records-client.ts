import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  InstructorAssessment,
  InstructorLearningRecord,
  InstructorLearningRecordProgress,
} from "@/features/instructor-learning-records/types";
import type { AssessmentResult } from "@/features/student-course/types";

async function parseResponse<T>(
  response: Response,
  missingDataMessage: string,
): Promise<T> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-record response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(response.status, missingDataMessage, payload);
  }

  return payload.data;
}

export async function getInstructorLearningRecord(
  courseOfferingId: string,
  learningRecordId: string,
): Promise<InstructorLearningRecord> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "Learning-record response did not contain record data.",
  );
}

export async function getInstructorLearningRecordProgress(
  courseOfferingId: string,
  learningRecordId: string,
): Promise<InstructorLearningRecordProgress> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}/progress`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "Learning-record progress response did not contain progress data.",
  );
}

export interface ListInstructorLearningRecordAssessmentsParams {
  page?: number;
  pageSize?: number;
  learningObjectiveId?: string;
  questionBankId?: string;
  mode?: "progress" | "review";
  status?: "created" | "running" | "completed" | "canceled";
}

export async function listInstructorLearningRecordAssessments(
  courseOfferingId: string,
  learningRecordId: string,
  params: ListInstructorLearningRecordAssessmentsParams = {},
): Promise<PaginatedView<InstructorAssessment>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.learningObjectiveId) {
    searchParams.set("learning_objective_id", params.learningObjectiveId);
  }

  if (params.questionBankId) {
    searchParams.set("question_bank_id", params.questionBankId);
  }

  if (params.mode) {
    searchParams.set("mode", params.mode);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query
      ? `/api/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}/assessments?${query}`
      : `/api/instructor/course-offerings/${courseOfferingId}/learning-records/${learningRecordId}/assessments`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "Assessment response did not contain assessment data.",
  );
}

export async function getInstructorAssessmentResult(
  courseOfferingId: string,
  assessmentId: string,
): Promise<AssessmentResult> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}/assessments/${assessmentId}/result`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "Assessment-result response did not contain result data.",
  );
}
