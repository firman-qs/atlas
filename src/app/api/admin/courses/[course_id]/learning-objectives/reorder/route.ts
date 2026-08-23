import { NextRequest, NextResponse } from "next/server";

import type { ReorderLearningObjectivesRequest } from "@/features/admin-learning-objectives/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedUnitResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { course_id } = await context.params;

  let body: ReorderLearningObjectivesRequest;

  try {
    body = (await request.json()) as ReorderLearningObjectivesRequest;
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
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/courses/${course_id}/learning-objectives/reorder`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective reorder request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Learning objective service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
