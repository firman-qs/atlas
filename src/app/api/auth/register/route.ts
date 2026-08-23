import { NextResponse } from "next/server";

import type { RegisterRequest, User } from "@/features/auth/types";
import { backendRequest } from "@/lib/api/backend-client";

export async function POST(request: Request) {
  let body: RegisterRequest;

  try {
    body = (await request.json()) as RegisterRequest;
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
    const backend = await backendRequest<User>("/auth/register", {
      method: "POST",
      body,
    });

    if (!backend.payload) {
      return NextResponse.json(
        {
          success: false,
          message: "The registration service returned an invalid response.",
          data: null,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(backend.payload, {
      status: backend.status,
    });
  } catch (error) {
    console.error("ATLAS registration backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
