import type {
  AdminLearningObjective,
  CreateLearningObjectiveRequest,
  ReorderLearningObjectivesRequest,
  UpdateLearningObjectiveRequest,
} from "@/features/admin-learning-objectives/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

export interface ListLearningObjectivesParams {
  courseId: string;
  page?: number;
  pageSize?: number;
}

async function parseLearningObjectiveResponse(
  response: Response,
): Promise<AdminLearningObjective> {
  let payload: ApiResponse<AdminLearningObjective>;

  try {
    payload = (await response.json()) as ApiResponse<AdminLearningObjective>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Learning-objective response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

async function parseUnitResponse(response: Response): Promise<void> {
  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listLearningObjectives(
  params: ListLearningObjectivesParams,
): Promise<PaginatedView<AdminLearningObjective>> {
  const searchParams = new URLSearchParams();

  searchParams.set("course_id", params.courseId);

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  const response = await fetch(
    `/api/admin/learning-objectives?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminLearningObjective>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminLearningObjective>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective list response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Learning-objective list response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createLearningObjective(
  request: CreateLearningObjectiveRequest,
): Promise<AdminLearningObjective> {
  const response = await fetch("/api/admin/learning-objectives", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseLearningObjectiveResponse(response);
}

export async function updateLearningObjective(
  learningObjectiveId: string,
  request: UpdateLearningObjectiveRequest,
): Promise<AdminLearningObjective> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseLearningObjectiveResponse(response);
}

export async function deleteLearningObjective(
  learningObjectiveId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}

export async function reorderLearningObjectives(
  courseId: string,
  request: ReorderLearningObjectivesRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/courses/${courseId}/learning-objectives/reorder`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseUnitResponse(response);
}
