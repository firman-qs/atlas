import { NextRequest, NextResponse } from "next/server";

import type {
  AdminCourseOffering,
  UpdateCourseOfferingRequest,
} from "@/features/admin-course-offerings/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_offering_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { course_offering_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminCourseOffering>(
      request,
      `/admin/course-offerings/${course_offering_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course-offering detail request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course offering service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { course_offering_id } = await context.params;

  try {
    const body = (await request.json()) as UpdateCourseOfferingRequest;

    const result = await authenticatedBackendRequest<AdminCourseOffering>(
      request,
      `/admin/course-offerings/${course_offering_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course-offering update request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course offering service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { course_offering_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/course-offerings/${course_offering_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin course-offering deletion request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Course offering service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
