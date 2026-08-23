import { NextRequest, NextResponse } from "next/server";

import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface QuestionBankQuestion {
  id: string;
  concept_level_id: string;
  question_type: "mcq" | "essay";
  status: "draft" | "published";
  prompt: string;
}

interface RouteContext {
  params: Promise<{
    question_bank_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { question_bank_id } = await context.params;

  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/question-banks/${question_bank_id}/questions?${query}`
      : `/admin/question-banks/${question_bank_id}/questions`;

    const result = await authenticatedBackendRequest<
      PaginatedView<QuestionBankQuestion>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS question-bank questions request failed:", error);

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
