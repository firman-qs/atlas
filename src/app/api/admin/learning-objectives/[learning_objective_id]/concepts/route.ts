import { NextRequest, NextResponse } from "next/server";

import type { AdminLearningObjectiveConcept } from "@/features/admin-curriculum/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_objective_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { learning_objective_id } = await context.params;

  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/learning-objectives/${learning_objective_id}/concepts?${query}`
      : `/admin/learning-objectives/${learning_objective_id}/concepts`;

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminLearningObjectiveConcept>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective concept list request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Learning-objective concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
