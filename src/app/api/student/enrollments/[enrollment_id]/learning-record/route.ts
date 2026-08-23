import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface CreatedLearningRecord {
  id: string;
  enrollment_id: string;
  started_at: string;
  completed_at: string | null;
}

interface RouteContext {
  params: Promise<{
    enrollment_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { enrollment_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<CreatedLearningRecord>(
      request,
      `/me/enrollments/${enrollment_id}/learning-record`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS learning-record backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Learning service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
