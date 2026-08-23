import { NextRequest, NextResponse } from "next/server";

import type { AdminUser } from "@/features/admin-users/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/users?${query}`
      : "/admin/users";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminUser>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin user list request failed:", error);

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
