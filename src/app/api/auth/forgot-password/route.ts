import { NextResponse } from "next/server";

import type { ForgotPasswordRequest } from "@/features/auth/types";
import { backendRequest } from "@/lib/api/backend-client";

export async function POST(request: Request) {
  let body: ForgotPasswordRequest;

  try {
    body = (await request.json()) as ForgotPasswordRequest;
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
    const backend = await backendRequest<string>("/auth/forgot-password", {
      method: "POST",
      body,
    });

    if (!backend.payload) {
      return NextResponse.json(
        {
          success: false,
          message: "The password reset service returned an invalid response.",
          data: null,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(backend.payload, {
      status: backend.status,
    });
  } catch (error) {
    console.error("ATLAS forgot-password backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Password reset service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
