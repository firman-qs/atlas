import { NextRequest, NextResponse } from "next/server";

import type {
  AdminCourse,
  CreateCourseRequest,
} from "@/features/admin-courses/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query ? `/admin/courses?${query}` : "/admin/courses";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminCourse>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course list request failed:", error);

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

export async function POST(request: NextRequest) {
  let body: CreateCourseRequest;

  try {
    body = (await request.json()) as CreateCourseRequest;
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
      "/admin/courses",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course creation request failed:", error);

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
