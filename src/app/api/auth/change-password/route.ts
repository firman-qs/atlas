import { NextRequest, NextResponse } from "next/server";

import type { ChangePasswordRequest } from "@/features/auth/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function PATCH(request: NextRequest) {
  let body: ChangePasswordRequest;

  try {
    body = (await request.json()) as ChangePasswordRequest;
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
    const result = await authenticatedBackendRequest<string>(
      request,
      "/auth/change-password",
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS password-change request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Password service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
