import { NextRequest, NextResponse } from "next/server";

import type {
  QuestionBank,
  UpdateQuestionBankRequest,
} from "@/features/admin-question-banks/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    question_bank_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { question_bank_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<QuestionBank>(
      request,
      `/admin/question-banks/${question_bank_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question-bank detail request failed:", error);

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { question_bank_id } = await context.params;

  let body: UpdateQuestionBankRequest;

  try {
    body = (await request.json()) as UpdateQuestionBankRequest;
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
    const result = await authenticatedBackendRequest<QuestionBank>(
      request,
      `/admin/question-banks/${question_bank_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question-bank update request failed:", error);

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
  const { question_bank_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<null>(
      request,
      `/admin/question-banks/${question_bank_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question-bank deletion request failed:", error);

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
