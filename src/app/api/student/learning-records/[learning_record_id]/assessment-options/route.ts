import { NextRequest, NextResponse } from "next/server";

import type { AssessmentOptions } from "@/features/student-course/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_record_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { learning_record_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AssessmentOptions>(
      request,
      `/me/learning-records/${learning_record_id}/assessment-options`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS assessment-options backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Assessment options service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
