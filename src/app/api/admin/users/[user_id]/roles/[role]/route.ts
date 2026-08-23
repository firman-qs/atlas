import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedUnitResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    user_id: string;
    role: string;
  }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { user_id, role } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/users/${user_id}/roles/${role}`,
      {
        method: "PUT",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin role assignment request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User role service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { user_id, role } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/users/${user_id}/roles/${role}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin role removal request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User role service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
