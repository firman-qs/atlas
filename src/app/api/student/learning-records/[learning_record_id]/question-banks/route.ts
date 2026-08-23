import { NextRequest, NextResponse } from "next/server";

import type { StudentQuestionBank } from "@/features/student-course/types";
import type { PaginatedView } from "@/lib/api/types";
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
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);

    const query = searchParams.toString();

    const path = query
      ? `/me/learning-records/${learning_record_id}/question-banks?${query}`
      : `/me/learning-records/${learning_record_id}/question-banks`;

    const result = await authenticatedBackendRequest<
      PaginatedView<StudentQuestionBank>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS student question-bank backend request failed:", error);

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
