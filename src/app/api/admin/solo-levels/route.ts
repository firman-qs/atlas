import { NextRequest, NextResponse } from "next/server";

import type { AdminSoloLevel } from "@/features/admin-curriculum/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const result = await authenticatedBackendRequest<AdminSoloLevel[]>(
      request,
      "/admin/solo-levels",
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin SOLO-level list request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "SOLO level service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
