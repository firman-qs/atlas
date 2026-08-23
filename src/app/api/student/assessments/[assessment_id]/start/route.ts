import { NextRequest, NextResponse } from "next/server";

import type { CreatedAssessment } from "@/features/student-course/types";
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
    const result = await authenticatedBackendRequest<CreatedAssessment>(
      request,
      `/assessments/${assessment_id}/start`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS assessment start backend request failed:", error);

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
