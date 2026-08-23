import { NextRequest, NextResponse } from "next/server";

import type {
  SubmitAttemptRequest,
  SubmitAttemptResult,
} from "@/features/student-course/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    assessment_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { assessment_id } = await context.params;

  let body: SubmitAttemptRequest;

  try {
    body = (await request.json()) as SubmitAttemptRequest;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON request body.",
        data: null,
      },
      { status: 400 },
    );
  }

  try {
    const result = await authenticatedBackendRequest<SubmitAttemptResult>(
      request,
      `/assessments/${assessment_id}/attempts`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS attempt submission backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Assessment submission service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
