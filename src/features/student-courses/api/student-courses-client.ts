import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type { StudentEnrollment } from "@/features/student-courses/types";

export interface ListStudentCoursesParams {
  page?: number;
  pageSize?: number;
}

export async function listStudentCourses(
  params: ListStudentCoursesParams = {},
): Promise<PaginatedView<StudentEnrollment>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/student/enrollments?${query}` : "/api/student/enrollments",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<StudentEnrollment>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<StudentEnrollment>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid course response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Course response did not contain enrollment data.",
      payload,
    );
  }

  return payload.data;
}
