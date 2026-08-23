import { beforeEach, describe, expect, it, vi } from "vitest";

const backendRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/backend-client", () => ({
  backendRequest,
}));

import { POST } from "./route";

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the normalized email to the backend", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      payload: {
        success: true,
        message: "Success",
        data: "If an eligible account exists for that email, password reset instructions will be sent.",
      },
    });

    const request = new Request(
      "http://localhost:3001/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@atlas.edu",
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(backendRequest).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: {
        email: "user@atlas.edu",
      },
    });

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      message: "Success",
      data: "If an eligible account exists for that email, password reset instructions will be sent.",
    });
  });

  it("preserves a backend validation error", async () => {
    backendRequest.mockResolvedValue({
      ok: false,
      status: 400,
      payload: {
        success: false,
        message: "Request validation failed.",
        data: null,
      },
    });

    const request = new Request(
      "http://localhost:3001/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid",
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Request validation failed.",
      data: null,
    });
  });

  it("rejects an invalid JSON request body", async () => {
    const request = new Request(
      "http://localhost:3001/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{not-json",
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(backendRequest).not.toHaveBeenCalled();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Invalid JSON request body.",
      data: null,
    });
  });
});
