import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedUnitResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_objective_id: string;
  }>;
}

interface ReorderConceptsRequest {
  concept_ids: string[];
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { learning_objective_id } = await context.params;

  let body: ReorderConceptsRequest;

  try {
    body = (await request.json()) as ReorderConceptsRequest;
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
      `/admin/learning-objectives/${learning_objective_id}/concepts/reorder`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS concept reorder request failed:", error);

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
