import { NextRequest, NextResponse } from "next/server";

import { authenticatedBinaryBackendRequest } from "@/lib/auth/authenticated-binary-backend";
import {
  accessTokenCookie,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  refreshTokenCookie,
} from "@/lib/auth/cookies";

interface RouteContext {
  params: Promise<{
    media_id: string;
  }>;
}

function applyAuthenticationCookies(
  response: NextResponse,
  result: Awaited<ReturnType<typeof authenticatedBinaryBackendRequest>>,
) {
  if (result.clearAuthCookies) {
    response.cookies.set(clearAccessTokenCookie());
    response.cookies.set(clearRefreshTokenCookie());

    return;
  }

  if (result.newAccessToken && result.newRefreshToken) {
    response.cookies.set(accessTokenCookie(result.newAccessToken));
    response.cookies.set(refreshTokenCookie(result.newRefreshToken));
  }
}

function forwardedHeaders(response: Response): Headers {
  const headers = new Headers();

  for (const name of ["content-type", "content-length", "cache-control"]) {
    const value = response.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { media_id } = await context.params;

  try {
    const result = await authenticatedBinaryBackendRequest(
      request,
      `/media/${media_id}`,
      {
        method: "GET",
      },
    );

    const response = new NextResponse(result.response.body, {
      status: result.response.status,
      headers: forwardedHeaders(result.response),
    });

    applyAuthenticationCookies(response, result);

    return response;
  } catch (error) {
    console.error("ATLAS media backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Media service is unavailable.",
        data: null,
      },
      {
        status: 502,
      },
    );
  }
}
