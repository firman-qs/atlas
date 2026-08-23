import type {
  Assessment,
  AssessmentOptions,
  AssessmentQuestion,
  AssessmentResult,
  AssessmentState,
  CreateAssessmentRequest,
  CreatedAssessment,
  LearningRecordProgress,
  StudentQuestionBank,
  SubmitAttemptRequest,
  SubmitAttemptResult,
} from "@/features/student-course/types";
import type { StudentEnrollment } from "@/features/student-courses/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

export interface CreatedLearningRecord {
  id: string;
  enrollment_id: string;
  started_at: string;
  completed_at: string | null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.status, "ATLAS returned an invalid response.");
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "ATLAS response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function getStudentEnrollment(
  enrollmentId: string,
): Promise<StudentEnrollment> {
  const response = await fetch(`/api/student/enrollments/${enrollmentId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse<StudentEnrollment>(response);
}

export async function createLearningRecord(
  enrollmentId: string,
): Promise<CreatedLearningRecord> {
  const response = await fetch(
    `/api/student/enrollments/${enrollmentId}/learning-record`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<CreatedLearningRecord>(response);
}

export async function getLearningRecordProgress(
  learningRecordId: string,
): Promise<LearningRecordProgress> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/progress`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<LearningRecordProgress>(response);
}

export async function getAssessmentOptions(
  learningRecordId: string,
): Promise<AssessmentOptions> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/assessment-options`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<AssessmentOptions>(response);
}

export async function createAssessment(
  learningRecordId: string,
  request: CreateAssessmentRequest,
): Promise<CreatedAssessment> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/assessments`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseResponse<CreatedAssessment>(response);
}

export async function startAssessment(
  assessmentId: string,
): Promise<CreatedAssessment> {
  const response = await fetch(
    `/api/student/assessments/${assessmentId}/start`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<CreatedAssessment>(response);
}

export async function cancelAssessment(
  assessmentId: string,
): Promise<AssessmentState> {
  const response = await fetch(
    `/api/student/assessments/${assessmentId}/cancel`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<AssessmentState>(response);
}

export async function getAssessment(assessmentId: string): Promise<Assessment> {
  const response = await fetch(`/api/student/assessments/${assessmentId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse<Assessment>(response);
}

export async function getNextQuestion(
  assessmentId: string,
): Promise<AssessmentQuestion> {
  const response = await fetch(
    `/api/student/assessments/${assessmentId}/next-question`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<AssessmentQuestion>(response);
}

export async function submitAttempt(
  assessmentId: string,
  request: SubmitAttemptRequest,
): Promise<SubmitAttemptResult> {
  const response = await fetch(
    `/api/student/assessments/${assessmentId}/attempts`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseResponse<SubmitAttemptResult>(response);
}

export async function getAssessmentResult(
  assessmentId: string,
): Promise<AssessmentResult> {
  const response = await fetch(
    `/api/student/assessments/${assessmentId}/result`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<AssessmentResult>(response);
}

export async function listAssessments(
  page = 1,
  pageSize = 20,
): Promise<PaginatedView<Assessment>> {
  const response = await fetch(
    `/api/student/assessments?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<PaginatedView<Assessment>>(response);
}

export async function getStudentQuestionBanks(
  learningRecordId: string,
  page = 1,
  pageSize = 100,
): Promise<PaginatedView<StudentQuestionBank>> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/question-banks?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<PaginatedView<StudentQuestionBank>>(response);
}
