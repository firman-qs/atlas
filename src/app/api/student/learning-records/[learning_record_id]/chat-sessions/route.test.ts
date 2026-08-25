import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticatedBackendRequest = vi.hoisted(() => vi.fn());
const authenticatedJsonResponse = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authenticated-backend", () => ({
  authenticatedBackendRequest,
}));

vi.mock("@/lib/auth/authenticated-response", () => ({
  authenticatedJsonResponse,
}));

import {
  GET,
  POST,
} from "@/app/api/student/learning-records/[learning_record_id]/chat-sessions/route";

describe("POST /api/student/learning-records/[learning_record_id]/chat-sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards chat-session creation to the authenticated backend endpoint", async () => {
    const backendResult = {
      status: 201,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          id: "chat-session-1",
          learning_record_id: "learning-record-1",
          title: "New chat",
          created_at: "2026-08-25T00:00:00Z",
          updated_at: "2026-08-25T00:00:00Z",
        },
      },
    };

    const forwardedResponse = new Response(
      JSON.stringify(backendResult.payload),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/learning-records/learning-record-1/chat-sessions",
      {
        method: "POST",
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        learning_record_id: "learning-record-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/learning-records/learning-record-1/chat-sessions",
      {
        method: "POST",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(201);
  });

  it("returns 502 when the chat backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/learning-records/learning-record-1/chat-sessions",
      {
        method: "POST",
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        learning_record_id: "learning-record-1",
      }),
    });

    expect(response.status).toBe(502);

    expect(await response.json()).toEqual({
      success: false,
      message: "Chat service is unavailable.",
      data: null,
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

describe("GET /api/student/learning-records/[learning_record_id]/chat-sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards pagination when listing chat sessions", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          items: [
            {
              id: "chat-session-2",
              learning_record_id: "learning-record-1",
              title: "Gauss law discussion",
              created_at: "2026-08-25T00:00:00Z",
              updated_at: "2026-08-25T00:10:00Z",
              archived_at: null,
            },
          ],
          page: 2,
          page_size: 10,
          total: 11,
        },
      },
    };

    const forwardedResponse = new Response(
      JSON.stringify(backendResult.payload),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/learning-records/learning-record-1/chat-sessions?page=2&page_size=10",
      {
        method: "GET",
      },
    );

    const response = await GET(request as never, {
      params: Promise.resolve({
        learning_record_id: "learning-record-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/learning-records/learning-record-1/chat-sessions?page=2&page_size=10",
      {
        method: "GET",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(200);
  });

  it("returns 502 when listing chat sessions fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/learning-records/learning-record-1/chat-sessions?page=1&page_size=20",
      {
        method: "GET",
      },
    );

    const response = await GET(request as never, {
      params: Promise.resolve({
        learning_record_id: "learning-record-1",
      }),
    });

    expect(response.status).toBe(502);

    expect(await response.json()).toEqual({
      success: false,
      message: "Chat service is unavailable.",
      data: null,
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
