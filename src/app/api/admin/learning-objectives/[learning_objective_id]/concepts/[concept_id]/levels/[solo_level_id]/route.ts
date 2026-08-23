import { NextRequest, NextResponse } from "next/server";

import type { UpdateLearningObjectiveConceptLevelRequest } from "@/features/admin-learning-objectives/levels-types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_objective_id: string;
    concept_id: string;
    solo_level_id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id, solo_level_id } =
    await context.params;

  let body: UpdateLearningObjectiveConceptLevelRequest;

  try {
    body = (await request.json()) as UpdateLearningObjectiveConceptLevelRequest;
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
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}/levels/${solo_level_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS learning-objective concept level update request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Curriculum service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id, solo_level_id } =
    await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}/levels/${solo_level_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS learning-objective concept level removal request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Curriculum service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
