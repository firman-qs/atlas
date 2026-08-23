import { NextRequest, NextResponse } from "next/server";

import type { InstructorLearningRecordProgress } from "@/features/instructor-learning-records/types";
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
    const result =
      await authenticatedBackendRequest<InstructorLearningRecordProgress>(
        request,
        `/me/course-offerings/${course_offering_id}/learning-records/${learning_record_id}/progress`,
        {
          method: "GET",
        },
      );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor learning-record progress request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Learning record service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
