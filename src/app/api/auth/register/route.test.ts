import { beforeEach, describe, expect, it, vi } from "vitest";

const backendRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/backend-client", () => ({
  backendRequest,
}));

import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the registration request to the backend", async () => {
    backendRequest.mockResolvedValue({
      status: 201,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          id: "user-1",
          email: "student@atlas.edu",
          full_name: "Student One",
          updated_at: "2026-08-23T09:00:00+07:00",
        },
      },
    });

    const request = new Request("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: "Student One",
        email: "student@atlas.edu",
        password: "password123",
      }),
    });

    const response = await POST(request);

    expect(backendRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        full_name: "Student One",
        email: "student@atlas.edu",
        password: "password123",
      },
    });

    expect(response.status).toBe(201);

    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "Success",
      data: {
        id: "user-1",
        email: "student@atlas.edu",
        full_name: "Student One",
        updated_at: "2026-08-23T09:00:00+07:00",
      },
    });
  });

  it("preserves a backend email-conflict error", async () => {
    backendRequest.mockResolvedValue({
      status: 409,
      ok: false,
      payload: {
        success: false,
        message: "Email is already registered.",
        data: null,
      },
    });

    const request = new Request("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: "Student One",
        email: "student@atlas.edu",
        password: "password123",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Email is already registered.",
      data: null,
    });
  });

  it("rejects an invalid JSON request body", async () => {
    const request = new Request("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{ invalid json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(backendRequest).not.toHaveBeenCalled();

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Invalid JSON request body.",
      data: null,
    });
  });
});
