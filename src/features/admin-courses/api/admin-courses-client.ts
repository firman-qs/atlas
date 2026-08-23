import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  AdminCourse,
  AdminCourseSortField,
  CreateCourseRequest,
  SortOrder,
  UpdateCourseRequest,
} from "@/features/admin-courses/types";

export interface ListAdminCoursesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  sort?: AdminCourseSortField;
  order?: SortOrder;
}

export async function listAdminCourses(
  params: ListAdminCoursesParams = {},
): Promise<PaginatedView<AdminCourse>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.active !== undefined) {
    searchParams.set("active", String(params.active));
  }

  if (params.search !== undefined && params.search.trim() !== "") {
    searchParams.set("search", params.search.trim());
  }

  if (params.sort !== undefined) {
    searchParams.set("sort", params.sort);
  }

  if (params.order !== undefined) {
    searchParams.set("order", params.order);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/admin/courses?${query}` : "/api/admin/courses",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminCourse>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminCourse>
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
      "Course response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createAdminCourse(
  request: CreateCourseRequest,
): Promise<AdminCourse> {
  const response = await fetch("/api/admin/courses", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  let payload: ApiResponse<AdminCourse>;

  try {
    payload = (await response.json()) as ApiResponse<AdminCourse>;
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
      "Course response did not contain data.",
      payload,
    );
  }

  return payload.data;
}
export async function getAdminCourse(courseId: string): Promise<AdminCourse> {
  const response = await fetch(`/api/admin/courses/${courseId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseCourseResponse(response);
}

export async function updateAdminCourse(
  courseId: string,
  request: UpdateCourseRequest,
): Promise<AdminCourse> {
  const response = await fetch(`/api/admin/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseCourseResponse(response);
}

async function parseCourseResponse(response: Response): Promise<AdminCourse> {
  let payload: ApiResponse<AdminCourse>;

  try {
    payload = (await response.json()) as ApiResponse<AdminCourse>;
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
      "Course response did not contain data.",
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
      "ATLAS returned an invalid course response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function activateAdminCourse(courseId: string): Promise<void> {
  const response = await fetch(`/api/admin/courses/${courseId}/activate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}

export async function deactivateAdminCourse(courseId: string): Promise<void> {
  const response = await fetch(`/api/admin/courses/${courseId}/deactivate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}

export async function deleteAdminCourse(courseId: string): Promise<void> {
  const response = await fetch(`/api/admin/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}
