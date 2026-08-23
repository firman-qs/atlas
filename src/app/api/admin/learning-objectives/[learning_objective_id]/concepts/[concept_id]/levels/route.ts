import { NextRequest, NextResponse } from "next/server";

import type {
  AddLearningObjectiveConceptLevelRequest,
  AdminLearningObjectiveConceptLevel,
} from "@/features/admin-learning-objectives/levels-types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_objective_id: string;
    concept_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<
      AdminLearningObjectiveConceptLevel[]
    >(
      request,
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}/levels`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS learning-objective concept level list request failed:",
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

export async function POST(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id } = await context.params;

  let body: AddLearningObjectiveConceptLevelRequest;

  try {
    body = (await request.json()) as AddLearningObjectiveConceptLevelRequest;
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
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}/levels`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS learning-objective concept level creation request failed:",
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
