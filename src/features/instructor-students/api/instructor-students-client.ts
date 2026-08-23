import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type { InstructorStudent } from "@/features/instructor-students/types";

export interface ListInstructorStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function listInstructorStudents(
  params: ListInstructorStudentsParams = {},
): Promise<PaginatedView<InstructorStudent>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search !== undefined && params.search.trim() !== "") {
    searchParams.set("search", params.search.trim());
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/instructor/students?${query}` : "/api/instructor/students",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<InstructorStudent>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<InstructorStudent>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid instructor student response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Instructor student response did not contain data.",
      payload,
    );
  }

  return payload.data;
}
