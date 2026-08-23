import type {
  AdminConcept,
  CreateConceptRequest,
  UpdateConceptRequest,
} from "@/features/admin-concepts/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

export interface ListConceptsParams {
  courseId: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

async function parseConceptResponse(response: Response): Promise<AdminConcept> {
  let payload: ApiResponse<AdminConcept>;

  try {
    payload = (await response.json()) as ApiResponse<AdminConcept>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid concept response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Concept response did not contain data.",
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
      "ATLAS returned an invalid concept response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listConcepts(
  params: ListConceptsParams,
): Promise<PaginatedView<AdminConcept>> {
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

  const response = await fetch(
    `/api/admin/concepts?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminConcept>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminConcept>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid concept list response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Concept list response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createConcept(
  request: CreateConceptRequest,
): Promise<AdminConcept> {
  const response = await fetch("/api/admin/concepts", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseConceptResponse(response);
}

export async function getConcept(conceptId: string): Promise<AdminConcept> {
  const response = await fetch(`/api/admin/concepts/${conceptId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseConceptResponse(response);
}

export async function updateConcept(
  conceptId: string,
  request: UpdateConceptRequest,
): Promise<AdminConcept> {
  const response = await fetch(`/api/admin/concepts/${conceptId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseConceptResponse(response);
}

export async function deleteConcept(conceptId: string): Promise<void> {
  const response = await fetch(`/api/admin/concepts/${conceptId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}
