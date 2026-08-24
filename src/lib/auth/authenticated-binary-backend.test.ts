import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/backend-client", () => ({
  backendRequest,
}));

vi.mock("@/lib/config/env", () => ({
  env: {
    apiUrl: "http://localhost:3000",
  },
}));

import { authenticatedBinaryBackendRequest } from "@/lib/auth/authenticated-binary-backend";

function requestWithCookies(
  accessToken?: string,
  refreshToken?: string,
): NextRequest {
  const request = new NextRequest("http://localhost:3001/api/media/media-1");

  if (accessToken) {
    request.cookies.set("atlas_access_token", accessToken);
  }

  if (refreshToken) {
    request.cookies.set("atlas_refresh_token", refreshToken);
  }

  return request;
}

function authorizationFromFetchCall(callIndex: number): string | null {
  const [, init] = vi.mocked(fetch).mock.calls[callIndex];

  return new Headers(init?.headers).get("authorization");
}

describe("authenticatedBinaryBackendRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the existing access token for a successful binary request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(Uint8Array.from([1, 2, 3]), {
        status: 200,
        headers: {
          "content-type": "image/png",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await authenticatedBinaryBackendRequest(
      requestWithCookies("access-token", "refresh-token"),
      "/media/media-1",
      {
        method: "GET",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/media/media-1",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );

    expect(authorizationFromFetchCall(0)).toBe("Bearer access-token");

    expect(backendRequest).not.toHaveBeenCalled();

    expect(result.response.status).toBe(200);
    expect(result.newAccessToken).toBeUndefined();
    expect(result.newRefreshToken).toBeUndefined();
    expect(result.clearAuthCookies).toBeUndefined();
  });

  it("refreshes the token pair and retries the binary request exactly once after a 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            message: "Token has expired.",
            data: null,
          }),
          {
            status: 401,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(Uint8Array.from([4, 5, 6]), {
          status: 200,
          headers: {
            "content-type": "image/png",
          },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    backendRequest.mockResolvedValue({
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          access_token: "rotated-access-token",
          refresh_token: "rotated-refresh-token",
        },
      },
    });

    const result = await authenticatedBinaryBackendRequest(
      requestWithCookies("expired-access-token", "refresh-token"),
      "/media/media-1",
      {
        method: "GET",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(authorizationFromFetchCall(0)).toBe("Bearer expired-access-token");

    expect(authorizationFromFetchCall(1)).toBe("Bearer rotated-access-token");

    expect(backendRequest).toHaveBeenCalledTimes(1);

    expect(backendRequest).toHaveBeenCalledWith("/auth/refresh-token", {
      method: "POST",
      bearerToken: "refresh-token",
    });

    expect(result.response.status).toBe(200);
    expect(result.newAccessToken).toBe("rotated-access-token");
    expect(result.newRefreshToken).toBe("rotated-refresh-token");
    expect(result.clearAuthCookies).toBeUndefined();
  });

  it("returns an authentication-required response when no recoverable session exists", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    const result = await authenticatedBinaryBackendRequest(
      requestWithCookies(),
      "/media/media-1",
      {
        method: "GET",
      },
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(backendRequest).not.toHaveBeenCalled();

    expect(result.response.status).toBe(401);
    expect(result.clearAuthCookies).toBe(true);

    await expect(result.response.json()).resolves.toEqual({
      success: false,
      message: "Authentication is required.",
      data: null,
    });
  });

  it("clears authentication when refresh fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "Token has expired.",
          data: null,
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    backendRequest.mockResolvedValue({
      status: 401,
      ok: false,
      payload: {
        success: false,
        message: "Invalid authentication token.",
        data: null,
      },
    });

    const result = await authenticatedBinaryBackendRequest(
      requestWithCookies("expired-access-token", "invalid-refresh-token"),
      "/media/media-1",
      {
        method: "GET",
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(backendRequest).toHaveBeenCalledWith("/auth/refresh-token", {
      method: "POST",
      bearerToken: "invalid-refresh-token",
    });

    expect(result.response.status).toBe(401);
    expect(result.clearAuthCookies).toBe(true);
    expect(result.newAccessToken).toBeUndefined();
    expect(result.newRefreshToken).toBeUndefined();
  });
});
