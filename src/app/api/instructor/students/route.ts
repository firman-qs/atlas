import { NextRequest, NextResponse } from "next/server";

import type { InstructorStudent } from "@/features/instructor-students/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query ? `/me/students?${query}` : "/me/students";

    const result = await authenticatedBackendRequest<
      PaginatedView<InstructorStudent>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS instructor student list request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Student service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
