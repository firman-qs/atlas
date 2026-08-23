import { NextRequest, NextResponse } from "next/server";

import type {
  AdminAcademicTerm,
  UpdateAcademicTermRequest,
} from "@/features/admin-academic-terms/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    academic_term_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { academic_term_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminAcademicTerm>(
      request,
      `/admin/academic-terms/${academic_term_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS academic-term detail request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Academic term service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { academic_term_id } = await context.params;

  try {
    const body = (await request.json()) as UpdateAcademicTermRequest;

    const result = await authenticatedBackendRequest<AdminAcademicTerm>(
      request,
      `/admin/academic-terms/${academic_term_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS academic-term update request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Academic term service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { academic_term_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/academic-terms/${academic_term_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS academic-term deletion request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Academic term service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
