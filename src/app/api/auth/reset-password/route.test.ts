import { beforeEach, describe, expect, it, vi } from "vitest";

const backendRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/backend-client", () => ({
  backendRequest,
}));

import { POST } from "./route";

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the reset token and new password to the backend", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      payload: {
        success: true,
        message: "Success",
        data: "Password successfully reset.",
      },
    });

    const request = new Request(
      "http://localhost:3001/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "reset-token-123",
          password: "new-password-123",
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(backendRequest).toHaveBeenCalledWith("/auth/reset-password", {
      method: "POST",
      body: {
        token: "reset-token-123",
        password: "new-password-123",
      },
    });

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      message: "Success",
      data: "Password successfully reset.",
    });
  });

  it("preserves a backend reset-token error", async () => {
    backendRequest.mockResolvedValue({
      ok: false,
      status: 400,
      payload: {
        success: false,
        message: "Password reset token is invalid, expired, or already used.",
        data: null,
      },
    });

    const request = new Request(
      "http://localhost:3001/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "expired-token",
          password: "new-password-123",
        }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      success: false,
      message: "Password reset token is invalid, expired, or already used.",
      data: null,
    });
  });

  it("rejects an invalid JSON request body", async () => {
    const request = new Request(
      "http://localhost:3001/api/auth/reset-password",
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
