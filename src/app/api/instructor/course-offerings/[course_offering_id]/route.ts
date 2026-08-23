import { NextRequest, NextResponse } from "next/server";

import type { InstructorCourseOffering } from "@/features/instructor-course-offerings/types";
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
    const result = await authenticatedBackendRequest<InstructorCourseOffering>(
      request,
      `/me/course-offerings/${course_offering_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor course-offering detail request failed:",
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
