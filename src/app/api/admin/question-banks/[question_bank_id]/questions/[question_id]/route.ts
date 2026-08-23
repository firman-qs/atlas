import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    question_bank_id: string;
    question_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { question_bank_id, question_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<null>(
      request,
      `/admin/question-banks/${question_bank_id}/questions/${question_id}`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS attach-question request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Question bank service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { question_bank_id, question_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<null>(
      request,
      `/admin/question-banks/${question_bank_id}/questions/${question_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question-bank detach request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Question bank service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
