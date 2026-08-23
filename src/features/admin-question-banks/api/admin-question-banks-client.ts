import type {
  AdminQuestionSummary,
  CreateQuestionBankRequest,
  QuestionBank,
  QuestionBankQuestion,
  UpdateQuestionBankRequest,
} from "@/features/admin-question-banks/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

export interface ListQuestionBanksParams {
  page?: number;
  pageSize?: number;
}

export interface ListQuestionBankQuestionsParams {
  page?: number;
  pageSize?: number;
  status?: "draft" | "published";
  questionType?: "mcq" | "essay";
}

export async function listQuestionBanks(
  params: ListQuestionBanksParams = {},
): Promise<PaginatedView<QuestionBank>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/admin/question-banks?${query}` : "/api/admin/question-banks",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<QuestionBank>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<QuestionBank>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-bank response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createQuestionBank(
  request: CreateQuestionBankRequest,
): Promise<QuestionBank> {
  const response = await fetch("/api/admin/question-banks", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let payload: ApiResponse<QuestionBank>;

  try {
    payload = (await response.json()) as ApiResponse<QuestionBank>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-bank response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function getQuestionBank(
  questionBankId: string,
): Promise<QuestionBank> {
  const response = await fetch(`/api/admin/question-banks/${questionBankId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  let payload: ApiResponse<QuestionBank>;

  try {
    payload = (await response.json()) as ApiResponse<QuestionBank>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-bank response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function listQuestionBankQuestions(
  questionBankId: string,
  params: ListQuestionBankQuestionsParams = {},
): Promise<PaginatedView<QuestionBankQuestion>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params.questionType !== undefined) {
    searchParams.set("question_type", params.questionType);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query
      ? `/api/admin/question-banks/${questionBankId}/questions?${query}`
      : `/api/admin/question-banks/${questionBankId}/questions`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<QuestionBankQuestion>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<QuestionBankQuestion>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank question response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-bank question response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function detachQuestionFromBank(
  questionBankId: string,
  questionId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/question-banks/${questionBankId}/questions/${questionId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export interface ListAdminQuestionsParams {
  courseId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "draft" | "published";
  questionType?: "mcq" | "essay";
}

export async function listAdminQuestions(
  params: ListAdminQuestionsParams,
): Promise<PaginatedView<AdminQuestionSummary>> {
  const searchParams = new URLSearchParams();

  searchParams.set("course_id", params.courseId);

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

  const response = await fetch(
    `/api/admin/questions?${searchParams.toString()}`,
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

export async function attachQuestionToBank(
  questionBankId: string,
  questionId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/question-banks/${questionBankId}/questions/${questionId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function updateQuestionBank(
  questionBankId: string,
  request: UpdateQuestionBankRequest,
): Promise<QuestionBank> {
  const response = await fetch(`/api/admin/question-banks/${questionBankId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let payload: ApiResponse<QuestionBank>;

  try {
    payload = (await response.json()) as ApiResponse<QuestionBank>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-bank response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function deleteQuestionBank(
  questionBankId: string,
): Promise<void> {
  const response = await fetch(`/api/admin/question-banks/${questionBankId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-bank response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}
