import { NextRequest, NextResponse } from "next/server";

import type {
  AdminCourseOffering,
  CreateCourseOfferingRequest,
} from "@/features/admin-course-offerings/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/course-offerings?${query}`
      : "/admin/course-offerings";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminCourseOffering>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin course-offering list request failed:", error);

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCourseOfferingRequest;

    const result = await authenticatedBackendRequest<AdminCourseOffering>(
      request,
      "/admin/course-offerings",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin course-offering creation request failed:",
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
