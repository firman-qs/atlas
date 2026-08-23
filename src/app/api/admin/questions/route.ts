import { NextRequest, NextResponse } from "next/server";

import type {
  AdminQuestionSummary,
  CreateAdminQuestionRequest,
} from "@/features/admin-questions/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query ? `/admin/questions?${query}` : "/admin/questions";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminQuestionSummary>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question list request failed:", error);

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

export async function POST(request: NextRequest) {
  let body: CreateAdminQuestionRequest;

  try {
    body = (await request.json()) as CreateAdminQuestionRequest;
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
    const result = await authenticatedBackendRequest<AdminQuestionSummary>(
      request,
      "/admin/questions",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin question creation request failed:", error);

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
