import { NextRequest, NextResponse } from "next/server";

import type { StudentEnrollment } from "@/features/student-courses/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    enrollment_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { enrollment_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<StudentEnrollment>(
      request,
      `/me/enrollments/${enrollment_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS student enrollment backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Student course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
