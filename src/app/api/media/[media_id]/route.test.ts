import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticatedBinaryBackendRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authenticated-binary-backend", () => ({
  authenticatedBinaryBackendRequest,
}));

import { GET } from "@/app/api/media/[media_id]/route";

function request() {
  return new NextRequest("http://localhost:3001/api/media/media-1");
}

function context(mediaId = "media-1") {
  return {
    params: Promise.resolve({
      media_id: mediaId,
    }),
  };
}

describe("GET /api/media/[media_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the authenticated media response as binary content", async () => {
    const body = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);

    authenticatedBinaryBackendRequest.mockResolvedValue({
      response: new Response(body, {
        status: 200,
        headers: {
          "content-type": "image/png",
          "content-length": "4",
          "cache-control": "private, no-store",
        },
      }),
    });

    const response = await GET(request(), context());

    expect(authenticatedBinaryBackendRequest).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "/media/media-1",
      {
        method: "GET",
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("content-length")).toBe("4");
    expect(response.headers.get("cache-control")).toBe("private, no-store");

    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([
      0x89, 0x50, 0x4e, 0x47,
    ]);
  });

  it.each([403, 404])(
    "preserves backend %s responses instead of converting them to 502",
    async (status) => {
      authenticatedBinaryBackendRequest.mockResolvedValue({
        response: new Response(
          JSON.stringify({
            success: false,
            message:
              status === 403
                ? "You do not have permission to access this attempt media."
                : "Media asset not found.",
            data: null,
          }),
          {
            status,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      });

      const response = await GET(request(), context());

      expect(response.status).toBe(status);

      const payload = await response.json();

      expect(payload.success).toBe(false);
    },
  );

  it("applies rotated authentication cookies", async () => {
    authenticatedBinaryBackendRequest.mockResolvedValue({
      response: new Response(Uint8Array.from([1]), {
        status: 200,
        headers: {
          "content-type": "image/png",
        },
      }),
      newAccessToken: "new-access-token",
      newRefreshToken: "new-refresh-token",
    });

    const response = await GET(request(), context());

    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(setCookie).toContain("atlas_access_token=new-access-token");
    expect(setCookie).toContain("atlas_refresh_token=new-refresh-token");
  });

  it("clears authentication cookies when the session can no longer be recovered", async () => {
    authenticatedBinaryBackendRequest.mockResolvedValue({
      response: new Response(
        JSON.stringify({
          success: false,
          message: "Authentication is required.",
          data: null,
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
      clearAuthCookies: true,
    });

    const response = await GET(request(), context());

    expect(response.status).toBe(401);

    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(setCookie).toContain("atlas_access_token=");
    expect(setCookie).toContain("atlas_refresh_token=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("returns 502 only when the backend request itself fails", async () => {
    authenticatedBinaryBackendRequest.mockRejectedValue(
      new TypeError("fetch failed"),
    );

    const response = await GET(request(), context());

    expect(response.status).toBe(502);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Media service is unavailable.",
      data: null,
    });
  });
});
