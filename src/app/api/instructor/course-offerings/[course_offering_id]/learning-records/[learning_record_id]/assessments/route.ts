import { NextRequest, NextResponse } from "next/server";

import type { InstructorAssessment } from "@/features/instructor-learning-records/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_offering_id: string;
    learning_record_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { course_offering_id, learning_record_id } = await context.params;

  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/me/course-offerings/${course_offering_id}/learning-records/${learning_record_id}/assessments?${query}`
      : `/me/course-offerings/${course_offering_id}/learning-records/${learning_record_id}/assessments`;

    const result = await authenticatedBackendRequest<
      PaginatedView<InstructorAssessment>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor learning-record assessments request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Assessment service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
