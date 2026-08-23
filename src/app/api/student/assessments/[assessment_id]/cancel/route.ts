import { NextRequest, NextResponse } from "next/server";

import type { AssessmentState } from "@/features/student-course/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    assessment_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { assessment_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AssessmentState>(
      request,
      `/assessments/${assessment_id}/cancel`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS assessment cancellation backend request failed:",
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
