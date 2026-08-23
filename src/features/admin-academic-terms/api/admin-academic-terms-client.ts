import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  AcademicSemester,
  AdminAcademicTerm,
  CreateAcademicTermRequest,
  UpdateAcademicTermRequest,
} from "@/features/admin-academic-terms/types";

export interface ListAdminAcademicTermsParams {
  page?: number;
  pageSize?: number;
  year?: number;
  semester?: AcademicSemester;
}

async function parseAcademicTermResponse(
  response: Response,
): Promise<AdminAcademicTerm> {
  let payload: ApiResponse<AdminAcademicTerm>;

  try {
    payload = (await response.json()) as ApiResponse<AdminAcademicTerm>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid academic-term response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Academic-term response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

async function parseUnitResponse(response: Response): Promise<void> {
  let payload: ApiResponse<unknown>;

  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid academic-term response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listAdminAcademicTerms(
  params: ListAdminAcademicTermsParams = {},
): Promise<PaginatedView<AdminAcademicTerm>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params.semester !== undefined) {
    searchParams.set("semester", params.semester);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/admin/academic-terms?${query}` : "/api/admin/academic-terms",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminAcademicTerm>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminAcademicTerm>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid academic-term response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Academic-term response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function getAdminAcademicTerm(
  academicTermId: string,
): Promise<AdminAcademicTerm> {
  const response = await fetch(`/api/admin/academic-terms/${academicTermId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseAcademicTermResponse(response);
}

export async function createAdminAcademicTerm(
  request: CreateAcademicTermRequest,
): Promise<AdminAcademicTerm> {
  const response = await fetch("/api/admin/academic-terms", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseAcademicTermResponse(response);
}

export async function updateAdminAcademicTerm(
  academicTermId: string,
  request: UpdateAcademicTermRequest,
): Promise<AdminAcademicTerm> {
  const response = await fetch(`/api/admin/academic-terms/${academicTermId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseAcademicTermResponse(response);
}

export async function deleteAdminAcademicTerm(
  academicTermId: string,
): Promise<void> {
  const response = await fetch(`/api/admin/academic-terms/${academicTermId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}
