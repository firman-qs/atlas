import { NextRequest, NextResponse } from "next/server";

import type { AdminQuestionSummary } from "@/features/admin-questions/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    question_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { question_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminQuestionSummary>(
      request,
      `/admin/questions/${question_id}/unpublish`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question unpublication request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Question service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
