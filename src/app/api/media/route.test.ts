import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticatedBackendRequest = vi.hoisted(() => vi.fn());
const authenticatedJsonResponse = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authenticated-backend", () => ({
  authenticatedBackendRequest,
}));

vi.mock("@/lib/auth/authenticated-response", () => ({
  authenticatedJsonResponse,
}));

import { POST } from "@/app/api/media/route";

interface TestFormData {
  get(name: string): unknown;
}

function formDataWithFile(): TestFormData {
  const file = {
    name: "figure.png",
    type: "image/png",
    size: 11,
  };

  return {
    get(name: string) {
      return name === "file" ? file : null;
    },
  };
}

function request(
  purpose?: string,
  options?: {
    formData?: TestFormData;
    formDataError?: unknown;
  },
): NextRequest {
  const url = new URL("http://localhost:3001/api/media");

  if (purpose !== undefined) {
    url.searchParams.set("purpose", purpose);
  }

  const req = new NextRequest(url, {
    method: "POST",
  });

  if (options?.formDataError !== undefined) {
    vi.spyOn(req, "formData").mockRejectedValue(options.formDataError);
  } else {
    vi.spyOn(req, "formData").mockResolvedValue(
      (options?.formData ?? formDataWithFile()) as FormData,
    );
  }

  return req;
}

describe("POST /api/media", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards authoring media as multipart data to the backend", async () => {
    const backendResult = {
      response: {
        status: 200,
        ok: true,
        payload: {
          success: true,
          message: "Success",
          data: {
            id: "media-1",
            purpose: "authoring",
            original_filename: "figure.png",
            mime_type: "image/png",
            size_bytes: 11,
          },
        },
      },
    };

    const forwardedResponse = NextResponse.json(
      backendResult.response.payload,
      {
        status: 200,
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const req = request("authoring");

    const response = await POST(req);

    expect(req.formData).toHaveBeenCalledTimes(1);

    expect(authenticatedBackendRequest).toHaveBeenCalledTimes(1);

    const [forwardedRequest, path, options] =
      authenticatedBackendRequest.mock.calls[0];

    expect(forwardedRequest).toBe(req);
    expect(path).toBe("/media?purpose=authoring");
    expect(options.method).toBe("POST");

    expect(options.body).toBeDefined();
    expect(typeof options.body.get).toBe("function");

    const forwardedFile = options.body.get("file");

    expect(forwardedFile).toMatchObject({
      name: "figure.png",
      type: "image/png",
      size: 11,
    });

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);

    expect(response.status).toBe(200);
  });

  it("forwards attempt media using the requested purpose", async () => {
    const backendResult = {
      response: {
        status: 200,
        ok: true,
        payload: {
          success: true,
          message: "Success",
          data: {
            id: "media-2",
            purpose: "attempt",
            original_filename: "figure.png",
            mime_type: "image/png",
            size_bytes: 11,
          },
        },
      },
    };

    authenticatedBackendRequest.mockResolvedValue(backendResult);

    authenticatedJsonResponse.mockReturnValue(
      NextResponse.json(backendResult.response.payload, {
        status: 200,
      }),
    );

    const req = request("attempt");

    await POST(req);

    expect(req.formData).toHaveBeenCalledTimes(1);
    expect(authenticatedBackendRequest).toHaveBeenCalledTimes(1);

    const [forwardedRequest, path, options] =
      authenticatedBackendRequest.mock.calls[0];

    expect(forwardedRequest).toBe(req);
    expect(path).toBe("/media?purpose=attempt");
    expect(options.method).toBe("POST");

    const forwardedFile = options.body.get("file");

    expect(forwardedFile).toMatchObject({
      name: "figure.png",
      type: "image/png",
      size: 11,
    });
  });

  it("forwards chat media using the requested purpose", async () => {
    const backendResult = {
      response: {
        status: 200,
        ok: true,
        payload: {
          success: true,
          message: "Success",
          data: {
            id: "media-chat-1",
            purpose: "chat",
            original_filename: "diagram.png",
            mime_type: "image/png",
            size_bytes: 11,
          },
        },
      },
    };

    authenticatedBackendRequest.mockResolvedValue(backendResult);

    authenticatedJsonResponse.mockReturnValue(
      NextResponse.json(backendResult.response.payload, {
        status: 200,
      }),
    );

    const req = request("chat");

    await POST(req);

    expect(req.formData).toHaveBeenCalledTimes(1);

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      req,
      "/media?purpose=chat",
      expect.objectContaining({
        method: "POST",
      }),
    );

    const [, , options] = authenticatedBackendRequest.mock.calls[0];

    const forwardedFile = options.body.get("file");

    expect(forwardedFile).toMatchObject({
      name: "figure.png",
      type: "image/png",
      size: 11,
    });
  });

  it("rejects a missing purpose before parsing multipart data", async () => {
    const req = request();

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(req.formData).not.toHaveBeenCalled();
    expect(authenticatedBackendRequest).not.toHaveBeenCalled();

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Media purpose is required.",
      data: null,
    });
  });

  it("rejects an invalid purpose before parsing multipart data", async () => {
    const req = request("avatar");

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(req.formData).not.toHaveBeenCalled();
    expect(authenticatedBackendRequest).not.toHaveBeenCalled();

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Invalid media purpose.",
      data: null,
    });
  });

  it("returns 400 when the multipart request cannot be parsed", async () => {
    const req = request("authoring", {
      formDataError: new TypeError("Invalid multipart body"),
    });

    const response = await POST(req);

    expect(req.formData).toHaveBeenCalledTimes(1);
    expect(authenticatedBackendRequest).not.toHaveBeenCalled();

    expect(response.status).toBe(400);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Invalid multipart request.",
      data: null,
    });
  });

  it("returns 502 only when the backend request itself fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    authenticatedBackendRequest.mockRejectedValue(
      new TypeError("fetch failed"),
    );

    const req = request("authoring");

    const response = await POST(req);

    expect(req.formData).toHaveBeenCalledTimes(1);

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      req,
      "/media?purpose=authoring",
      expect.objectContaining({
        method: "POST",
      }),
    );

    expect(response.status).toBe(502);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Media upload service is unavailable.",
      data: null,
    });

    consoleError.mockRestore();
  });
});
