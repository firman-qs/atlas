import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedUnitResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { course_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/courses/${course_id}/activate`,
      {
        method: "POST",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin course activation request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Course service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
