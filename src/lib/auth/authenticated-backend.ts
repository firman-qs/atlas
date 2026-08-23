import "server-only";

import type { NextRequest } from "next/server";

import type { JwtRefreshResult } from "@/features/auth/types";
import { backendRequest, type BackendResponse } from "@/lib/api/backend-client";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";

export interface AuthenticatedBackendResult<T> {
  response: BackendResponse<T>;
  newAccessToken?: string;
  newRefreshToken?: string;
  clearAuthCookies?: boolean;
}

export async function authenticatedBackendRequest<T>(
  request: NextRequest,
  path: string,
  options: Omit<Parameters<typeof backendRequest<T>>[1], "bearerToken"> = {},
): Promise<AuthenticatedBackendResult<T>> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // ------------------------------------------------------------
  // 1. Try the existing access token.
  // ------------------------------------------------------------

  if (accessToken) {
    const response = await backendRequest<T>(path, {
      ...options,
      bearerToken: accessToken,
    });

    if (response.status !== 401) {
      return { response };
    }
  }

  // ------------------------------------------------------------
  // 2. Access token is missing/rejected.
  //    A refresh token is required to recover the session.
  // ------------------------------------------------------------

  if (!refreshToken) {
    return {
      response: {
        status: 401,
        ok: false,
        payload: {
          success: false,
          message: "Authentication is required.",
          data: null,
        },
      },
      clearAuthCookies: true,
    };
  }

  // ------------------------------------------------------------
  // 3. Rotate the token pair.
  // ------------------------------------------------------------

  const refreshed = await backendRequest<JwtRefreshResult>(
    "/auth/refresh-token",
    {
      method: "POST",
      bearerToken: refreshToken,
    },
  );

  if (!refreshed.ok || !refreshed.payload?.success || !refreshed.payload.data) {
    return {
      response: {
        status: 401,
        ok: false,
        payload: {
          success: false,
          message: "Authentication is required.",
          data: null,
        },
      },
      clearAuthCookies: true,
    };
  }

  const { access_token: newAccessToken, refresh_token: newRefreshToken } =
    refreshed.payload.data;

  // ------------------------------------------------------------
  // 4. Retry the original backend request exactly once using
  //    the newly issued access token.
  // ------------------------------------------------------------

  const response = await backendRequest<T>(path, {
    ...options,
    bearerToken: newAccessToken,
  });

  if (response.status === 401) {
    return {
      response,
      clearAuthCookies: true,
    };
  }

  return {
    response,
    newAccessToken,
    newRefreshToken,
  };
}
