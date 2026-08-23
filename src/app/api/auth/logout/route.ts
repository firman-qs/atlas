import { NextResponse } from "next/server";

import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
} from "@/lib/auth/cookies";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
    data: null,
  });

  response.cookies.set(clearAccessTokenCookie());
  response.cookies.set(clearRefreshTokenCookie());

  return response;
}
