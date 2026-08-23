import { NextRequest, NextResponse } from "next/server";

import type { AssessmentResult } from "@/features/student-course/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    assessment_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { assessment_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AssessmentResult>(
      request,
      `/assessments/${assessment_id}/result`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS assessment result backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Assessment result service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
