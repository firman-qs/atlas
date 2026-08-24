import "server-only";

import type { NextRequest } from "next/server";

import type { JwtRefreshResult } from "@/features/auth/types";
import { backendRequest } from "@/lib/api/backend-client";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { env } from "@/lib/config/env";

export interface AuthenticatedBinaryBackendResult {
  response: Response;
  newAccessToken?: string;
  newRefreshToken?: string;
  clearAuthCookies?: boolean;
}

async function binaryBackendRequest(
  path: string,
  bearerToken: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${bearerToken}`);

  return fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

function authenticationRequiredResponse(): Response {
  return Response.json(
    {
      success: false,
      message: "Authentication is required.",
      data: null,
    },
    {
      status: 401,
    },
  );
}

export async function authenticatedBinaryBackendRequest(
  request: NextRequest,
  path: string,
  options: RequestInit = {},
): Promise<AuthenticatedBinaryBackendResult> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // ------------------------------------------------------------
  // 1. Try the current access token.
  // ------------------------------------------------------------

  if (accessToken) {
    const response = await binaryBackendRequest(path, accessToken, options);

    if (response.status !== 401) {
      return { response };
    }
  }

  // ------------------------------------------------------------
  // 2. Recover the session using the refresh token.
  // ------------------------------------------------------------

  if (!refreshToken) {
    return {
      response: authenticationRequiredResponse(),
      clearAuthCookies: true,
    };
  }

  const refreshed = await backendRequest<JwtRefreshResult>(
    "/auth/refresh-token",
    {
      method: "POST",
      bearerToken: refreshToken,
    },
  );

  if (!refreshed.ok || !refreshed.payload?.success || !refreshed.payload.data) {
    return {
      response: authenticationRequiredResponse(),
      clearAuthCookies: true,
    };
  }

  const { access_token: newAccessToken, refresh_token: newRefreshToken } =
    refreshed.payload.data;

  // ------------------------------------------------------------
  // 3. Retry the binary request exactly once.
  // ------------------------------------------------------------

  const response = await binaryBackendRequest(path, newAccessToken, options);

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
