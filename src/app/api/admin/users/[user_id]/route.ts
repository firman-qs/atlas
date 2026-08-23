import { NextRequest, NextResponse } from "next/server";

import type { AdminUser } from "@/features/admin-users/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import {
  authenticatedJsonResponse,
  authenticatedUnitResponse,
} from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    user_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { user_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<AdminUser>(
      request,
      `/admin/users/${user_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin user detail request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { user_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/admin/users/${user_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS admin user deletion request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
