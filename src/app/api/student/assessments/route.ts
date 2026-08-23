import { NextRequest, NextResponse } from "next/server";

import type { Assessment } from "@/features/student-course/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);

    const query = searchParams.toString();

    const path = query ? `/me/assessments?${query}` : "/me/assessments";

    const result = await authenticatedBackendRequest<PaginatedView<Assessment>>(
      request,
      path,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS assessment list backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Assessment history service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
