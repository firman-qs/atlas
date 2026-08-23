import "server-only";

import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/api/types";
import type { AuthenticatedBackendResult } from "@/lib/auth/authenticated-backend";
import {
  accessTokenCookie,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  refreshTokenCookie,
} from "@/lib/auth/cookies";

export function authenticatedJsonResponse<T>(
  result: AuthenticatedBackendResult<T>,
): NextResponse<ApiResponse<T>> {
  const { response } = result;

  const payload: ApiResponse<T> = response.payload ?? {
    success: false,
    message: "The ATLAS API returned an invalid response.",
    data: null,
  };

  const status = response.payload ? response.status : 502;

  const nextResponse = NextResponse.json(payload, { status });

  if (result.clearAuthCookies) {
    nextResponse.cookies.set(clearAccessTokenCookie());
    nextResponse.cookies.set(clearRefreshTokenCookie());

    return nextResponse;
  }

  if (result.newAccessToken && result.newRefreshToken) {
    nextResponse.cookies.set(accessTokenCookie(result.newAccessToken));
    nextResponse.cookies.set(refreshTokenCookie(result.newRefreshToken));
  }

  return nextResponse;
}

export function authenticatedUnitResponse(
  result: AuthenticatedBackendResult<unknown>,
): NextResponse<ApiResponse<unknown>> {
  const { response } = result;

  if (response.ok && response.status === 204) {
    const nextResponse = NextResponse.json(
      {
        success: true,
        message: "Success",
        data: null,
      },
      { status: 200 },
    );

    if (result.clearAuthCookies) {
      nextResponse.cookies.set(clearAccessTokenCookie());
      nextResponse.cookies.set(clearRefreshTokenCookie());

      return nextResponse;
    }

    if (result.newAccessToken && result.newRefreshToken) {
      nextResponse.cookies.set(accessTokenCookie(result.newAccessToken));
      nextResponse.cookies.set(refreshTokenCookie(result.newRefreshToken));
    }

    return nextResponse;
  }

  return authenticatedJsonResponse(result);
}
