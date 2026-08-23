import { NextRequest, NextResponse } from "next/server";

import type {
  AdminCourse,
  UpdateCourseRequest,
} from "@/features/admin-courses/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import {
  authenticatedJsonResponse,
  authenticatedUnitResponse,
} from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { course_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminCourse>(
      request,
      `/admin/courses/${course_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course detail request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { course_id } = await context.params;

  let body: UpdateCourseRequest;

  try {
    body = (await request.json()) as UpdateCourseRequest;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON request body.",
        data: null,
      },
      { status: 400 },
    );
  }

  try {
    const result = await authenticatedBackendRequest<AdminCourse>(
      request,
      `/admin/courses/${course_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course update request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { course_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/courses/${course_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin course deletion request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
