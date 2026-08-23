import { NextRequest, NextResponse } from "next/server";

import type { StudentEnrollment } from "@/features/student-courses/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);

    const query = searchParams.toString();

    const path = query ? `/me/enrollments?${query}` : "/me/enrollments";

    const result = await authenticatedBackendRequest<
      PaginatedView<StudentEnrollment>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS student enrollments backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Student course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
