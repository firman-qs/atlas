import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  CreatedInstructorEnrollment,
  CreateInstructorEnrollmentRequest,
  InstructorCourseOffering,
  InstructorEnrollment,
} from "@/features/instructor-course-offerings/types";

export interface ListInstructorCourseOfferingsParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  academicTermId?: string;
}

export async function listInstructorCourseOfferings(
  params: ListInstructorCourseOfferingsParams = {},
): Promise<PaginatedView<InstructorCourseOffering>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.courseId !== undefined && params.courseId !== "") {
    searchParams.set("course_id", params.courseId);
  }

  if (params.academicTermId !== undefined && params.academicTermId !== "") {
    searchParams.set("academic_term_id", params.academicTermId);
  }

  const query = searchParams.toString();

  const response = await fetch(
    query
      ? `/api/instructor/course-offerings?${query}`
      : "/api/instructor/course-offerings",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<InstructorCourseOffering>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<InstructorCourseOffering>
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

export async function getInstructorCourseOffering(
  courseOfferingId: string,
): Promise<InstructorCourseOffering> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<InstructorCourseOffering>;

  try {
    payload = (await response.json()) as ApiResponse<InstructorCourseOffering>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid course offering response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Course offering response did not contain offering data.",
      payload,
    );
  }

  return payload.data;
}

export interface ListInstructorCourseOfferingEnrollmentsParams {
  page?: number;
  pageSize?: number;
}

export async function listInstructorCourseOfferingEnrollments(
  courseOfferingId: string,
  params: ListInstructorCourseOfferingEnrollmentsParams = {},
): Promise<PaginatedView<InstructorEnrollment>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  const query = searchParams.toString();

  const response = await fetch(
    query
      ? `/api/instructor/course-offerings/${courseOfferingId}/enrollments?${query}`
      : `/api/instructor/course-offerings/${courseOfferingId}/enrollments`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<InstructorEnrollment>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<InstructorEnrollment>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid enrollment response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Enrollment response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createInstructorEnrollment(
  courseOfferingId: string,
  request: CreateInstructorEnrollmentRequest,
): Promise<CreatedInstructorEnrollment> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}/enrollments`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  let payload: ApiResponse<CreatedInstructorEnrollment>;

  try {
    payload =
      (await response.json()) as ApiResponse<CreatedInstructorEnrollment>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid enrollment response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Enrollment response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function deleteInstructorEnrollment(
  courseOfferingId: string,
  enrollmentId: string,
): Promise<void> {
  const response = await fetch(
    `/api/instructor/course-offerings/${courseOfferingId}/enrollments/${enrollmentId}`,
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
      "ATLAS returned an invalid enrollment response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}
