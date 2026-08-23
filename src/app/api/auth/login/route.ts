import { NextResponse } from "next/server";

import type { BackendLoginView, LoginRequest } from "@/features/auth/types";
import { backendRequest } from "@/lib/api/backend-client";
import { accessTokenCookie, refreshTokenCookie } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  let body: LoginRequest;

  try {
    body = (await request.json()) as LoginRequest;
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
    const backend = await backendRequest<BackendLoginView>("/auth/login", {
      method: "POST",
      body,
    });

    if (!backend.payload) {
      return NextResponse.json(
        {
          success: false,
          message: "The authentication service returned an invalid response.",
          data: null,
        },
        { status: 502 },
      );
    }

    if (!backend.ok || !backend.payload.success || !backend.payload.data) {
      return NextResponse.json(backend.payload, {
        status: backend.status,
      });
    }

    const { access_token, refresh_token, user } = backend.payload.data;

    // Never expose either JWT to browser JavaScript.
    const response = NextResponse.json({
      success: true,
      message: backend.payload.message,
      data: {
        user,
      },
    });

    response.cookies.set(accessTokenCookie(access_token));
    response.cookies.set(refreshTokenCookie(refresh_token));

    return response;
  } catch (error) {
    console.error("ATLAS login backend request failed:", error);

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
