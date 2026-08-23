import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_offering_id: string;
    enrollment_id: string;
  }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { course_offering_id, enrollment_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<null>(
      request,
      `/me/course-offerings/${course_offering_id}/enrollments/${enrollment_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor enrollment deletion request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Enrollment service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
