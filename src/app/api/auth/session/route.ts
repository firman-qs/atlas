import { NextRequest, NextResponse } from "next/server";

import type { Me } from "@/features/auth/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const result = await authenticatedBackendRequest<Me>(request, "/me", {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS session backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Authentication service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
