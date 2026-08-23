import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  AdminCourseOffering,
  CreateCourseOfferingRequest,
  UpdateCourseOfferingRequest,
} from "@/features/admin-course-offerings/types";

export interface ListAdminCourseOfferingsParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  academicTermId?: string;
  instructorId?: string;
}

async function parseCourseOfferingResponse(
  response: Response,
): Promise<AdminCourseOffering> {
  let payload: ApiResponse<AdminCourseOffering>;

  try {
    payload = (await response.json()) as ApiResponse<AdminCourseOffering>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid course-offering response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Course-offering response did not contain data.",
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
      "ATLAS returned an invalid course-offering response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listAdminCourseOfferings(
  params: ListAdminCourseOfferingsParams = {},
): Promise<PaginatedView<AdminCourseOffering>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.courseId) {
    searchParams.set("course_id", params.courseId);
  }

  if (params.academicTermId) {
    searchParams.set("academic_term_id", params.academicTermId);
  }

  if (params.instructorId) {
    searchParams.set("instructor_id", params.instructorId);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query
      ? `/api/admin/course-offerings?${query}`
      : "/api/admin/course-offerings",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminCourseOffering>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminCourseOffering>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid course-offering response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Course-offering response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function getAdminCourseOffering(
  courseOfferingId: string,
): Promise<AdminCourseOffering> {
  const response = await fetch(
    `/api/admin/course-offerings/${courseOfferingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseCourseOfferingResponse(response);
}

export async function createAdminCourseOffering(
  request: CreateCourseOfferingRequest,
): Promise<AdminCourseOffering> {
  const response = await fetch("/api/admin/course-offerings", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseCourseOfferingResponse(response);
}

export async function updateAdminCourseOffering(
  courseOfferingId: string,
  request: UpdateCourseOfferingRequest,
): Promise<AdminCourseOffering> {
  const response = await fetch(
    `/api/admin/course-offerings/${courseOfferingId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseCourseOfferingResponse(response);
}

export async function deleteAdminCourseOffering(
  courseOfferingId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/course-offerings/${courseOfferingId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}
