import { NextRequest, NextResponse } from "next/server";

import type { AdminLearningObjectiveConcept } from "@/features/admin-curriculum/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import {
  authenticatedJsonResponse,
  authenticatedUnitResponse,
} from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_objective_id: string;
    concept_id: string;
  }>;
}

interface UpdateConceptSettingsRequest {
  is_required: boolean;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id } = await context.params;

  try {
    const result =
      await authenticatedBackendRequest<AdminLearningObjectiveConcept>(
        request,
        `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}`,
        {
          method: "POST",
        },
      );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS concept attachment request failed:", error);

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { learning_objective_id, concept_id } = await context.params;

  let body: UpdateConceptSettingsRequest;

  try {
    body = (await request.json()) as UpdateConceptSettingsRequest;
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
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS concept settings update request failed:", error);

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
  const { learning_objective_id, concept_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/learning-objectives/${learning_objective_id}/concepts/${concept_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS concept detachment request failed:", error);

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
