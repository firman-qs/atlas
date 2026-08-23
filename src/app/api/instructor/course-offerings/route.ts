import { NextRequest, NextResponse } from "next/server";

import type { InstructorCourseOffering } from "@/features/instructor-course-offerings/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);

    const query = searchParams.toString();

    const path = query
      ? `/me/course-offerings?${query}`
      : "/me/course-offerings";

    const result = await authenticatedBackendRequest<
      PaginatedView<InstructorCourseOffering>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor course-offering list request failed:",
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
