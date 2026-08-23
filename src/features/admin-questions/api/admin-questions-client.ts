import type {
  AdminQuestionStatus,
  AdminQuestionSummary,
  AdminQuestionType,
  CreateAdminQuestionRequest,
  UpdateAdminQuestionRequest,
} from "@/features/admin-questions/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

async function parseQuestionResponse(
  response: Response,
  fallbackMessage: string,
): Promise<AdminQuestionSummary> {
  let payload: ApiResponse<AdminQuestionSummary>;

  try {
    payload = (await response.json()) as ApiResponse<AdminQuestionSummary>;
  } catch {
    throw new ApiError(response.status, fallbackMessage);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

async function parseUnitResponse(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(response.status, fallbackMessage);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export interface ListAdminQuestionsParams {
  courseId?: string;
  learningObjectiveId?: string;
  conceptId?: string;
  soloLevelId?: string;

  page?: number;
  pageSize?: number;

  search?: string;
  status?: AdminQuestionStatus;
  questionType?: AdminQuestionType;
}

export async function listAdminQuestions(
  params: ListAdminQuestionsParams = {},
): Promise<PaginatedView<AdminQuestionSummary>> {
  const searchParams = new URLSearchParams();

  if (params.courseId !== undefined) {
    searchParams.set("course_id", params.courseId);
  }

  if (params.learningObjectiveId !== undefined) {
    searchParams.set("learning_objective_id", params.learningObjectiveId);
  }

  if (params.conceptId !== undefined) {
    searchParams.set("concept_id", params.conceptId);
  }

  if (params.soloLevelId !== undefined) {
    searchParams.set("solo_level_id", params.soloLevelId);
  }

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search !== undefined && params.search.trim() !== "") {
    searchParams.set("search", params.search.trim());
  }

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params.questionType !== undefined) {
    searchParams.set("question_type", params.questionType);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/admin/questions?${query}` : "/api/admin/questions",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminQuestionSummary>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminQuestionSummary>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createAdminQuestion(
  request: CreateAdminQuestionRequest,
): Promise<AdminQuestionSummary> {
  const response = await fetch("/api/admin/questions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let payload: ApiResponse<AdminQuestionSummary>;

  try {
    payload = (await response.json()) as ApiResponse<AdminQuestionSummary>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question creation response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question creation response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function getAdminQuestion(
  questionId: string,
): Promise<AdminQuestionSummary> {
  const response = await fetch(`/api/admin/questions/${questionId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseQuestionResponse(
    response,
    "ATLAS returned an invalid question detail response.",
  );
}

export async function updateAdminQuestion(
  questionId: string,
  request: UpdateAdminQuestionRequest,
): Promise<AdminQuestionSummary> {
  const response = await fetch(`/api/admin/questions/${questionId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseQuestionResponse(
    response,
    "ATLAS returned an invalid question update response.",
  );
}

export async function deleteAdminQuestion(questionId: string): Promise<void> {
  const response = await fetch(`/api/admin/questions/${questionId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(
    response,
    "ATLAS returned an invalid question deletion response.",
  );
}

export async function publishAdminQuestion(
  questionId: string,
): Promise<AdminQuestionSummary> {
  const response = await fetch(`/api/admin/questions/${questionId}/publish`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseQuestionResponse(
    response,
    "ATLAS returned an invalid question publication response.",
  );
}

export async function unpublishAdminQuestion(
  questionId: string,
): Promise<AdminQuestionSummary> {
  const response = await fetch(`/api/admin/questions/${questionId}/unpublish`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseQuestionResponse(
    response,
    "ATLAS returned an invalid question unpublication response.",
  );
}
