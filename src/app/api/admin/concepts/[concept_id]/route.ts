import { NextRequest, NextResponse } from "next/server";

import type {
  AdminConcept,
  UpdateConceptRequest,
} from "@/features/admin-concepts/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import {
  authenticatedJsonResponse,
  authenticatedUnitResponse,
} from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    concept_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { concept_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminConcept>(
      request,
      `/admin/concepts/${concept_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin concept detail request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { concept_id } = await context.params;

  let body: UpdateConceptRequest;

  try {
    body = (await request.json()) as UpdateConceptRequest;
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
    const result = await authenticatedBackendRequest<AdminConcept>(
      request,
      `/admin/concepts/${concept_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin concept update request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { concept_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/concepts/${concept_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin concept deletion request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
