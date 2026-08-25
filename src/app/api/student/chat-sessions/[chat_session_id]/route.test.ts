import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticatedBackendRequest = vi.hoisted(() => vi.fn());
const authenticatedJsonResponse = vi.hoisted(() => vi.fn());
const authenticatedUnitResponse = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authenticated-backend", () => ({
  authenticatedBackendRequest,
}));

vi.mock("@/lib/auth/authenticated-response", () => ({
  authenticatedJsonResponse,
  authenticatedUnitResponse,
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/student/chat-sessions/[chat_session_id]/route";

describe("GET /api/student/chat-sessions/[chat_session_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards chat-session retrieval to the authenticated backend endpoint", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          id: "chat-session-1",
          learning_record_id: "learning-record-1",
          title: "Maxwell equations",
          created_at: "2026-08-25T00:00:00Z",
          updated_at: "2026-08-25T00:10:00Z",
          archived_at: null,
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
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "GET",
      },
    );

    const response = await GET(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/chat-sessions/chat-session-1",
      {
        method: "GET",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(200);
  });

  it("preserves a backend not-found response", async () => {
    const backendResult = {
      status: 404,
      ok: false,
      payload: {
        success: false,
        message: "Chat session not found.",
        data: null,
      },
    };

    const forwardedResponse = new Response(
      JSON.stringify(backendResult.payload),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/missing-session",
      {
        method: "GET",
      },
    );

    const response = await GET(request as never, {
      params: Promise.resolve({
        chat_session_id: "missing-session",
      }),
    });

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(404);

    expect(await response.json()).toEqual({
      success: false,
      message: "Chat session not found.",
      data: null,
    });
  });

  it("returns 502 when the chat backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "GET",
      },
    );

    const response = await GET(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
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

describe("PATCH /api/student/chat-sessions/[chat_session_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards a chat-session rename to the authenticated backend", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          id: "chat-session-1",
          learning_record_id: "learning-record-1",
          title: "Maxwell equations review",
          created_at: "2026-08-25T00:00:00Z",
          updated_at: "2026-08-25T00:20:00Z",
          archived_at: null,
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
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Maxwell equations review",
        }),
      },
    );

    const response = await PATCH(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/chat-sessions/chat-session-1",
      {
        method: "PATCH",
        body: {
          title: "Maxwell equations review",
        },
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);

    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid JSON when renaming a chat session", async () => {
    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid",
      },
    );

    const response = await PATCH(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
      }),
    });

    expect(response.status).toBe(400);

    expect(await response.json()).toEqual({
      success: false,
      message: "Invalid JSON request body.",
      data: null,
    });

    expect(authenticatedBackendRequest).not.toHaveBeenCalled();
  });

  it("returns 502 when the chat-session rename backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Maxwell equations review",
        }),
      },
    );

    const response = await PATCH(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
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

describe("DELETE /api/student/chat-sessions/[chat_session_id]", () => {
  it("forwards chat-session archival to the authenticated backend", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: null,
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

    authenticatedUnitResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/chat-sessions/chat-session-1",
      {
        method: "DELETE",
      },
    );

    expect(authenticatedUnitResponse).toHaveBeenCalledWith(backendResult);

    expect(response.status).toBe(200);
  });

  it("returns 502 when the chat-session archive backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1",
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
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
