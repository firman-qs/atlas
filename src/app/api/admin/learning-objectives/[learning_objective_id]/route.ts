import { NextRequest, NextResponse } from "next/server";

import type {
  AdminLearningObjective,
  UpdateLearningObjectiveRequest,
} from "@/features/admin-learning-objectives/types";
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
    const result = await authenticatedBackendRequest<AdminLearningObjective>(
      request,
      `/admin/learning-objectives/${learning_objective_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective detail request failed:",
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { learning_objective_id } = await context.params;

  let body: UpdateLearningObjectiveRequest;

  try {
    body = (await request.json()) as UpdateLearningObjectiveRequest;
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
    const result = await authenticatedBackendRequest<AdminLearningObjective>(
      request,
      `/admin/learning-objectives/${learning_objective_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective update request failed:",
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { learning_objective_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<null>(
      request,
      `/admin/learning-objectives/${learning_objective_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective deletion request failed:",
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
