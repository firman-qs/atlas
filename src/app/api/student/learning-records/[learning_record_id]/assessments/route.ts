import { NextRequest, NextResponse } from "next/server";

import type {
  CreateAssessmentRequest,
  CreatedAssessment,
} from "@/features/student-course/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_record_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { learning_record_id } = await context.params;

  let body: CreateAssessmentRequest;

  try {
    body = (await request.json()) as CreateAssessmentRequest;
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
    const result = await authenticatedBackendRequest<CreatedAssessment>(
      request,
      `/me/learning-records/${learning_record_id}/assessments`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS assessment creation backend request failed:", error);

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
