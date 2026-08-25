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
} from "@/app/api/student/chat-sessions/[chat_session_id]/messages/route";

describe("POST /api/student/chat-sessions/[chat_session_id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards a chat message and preserves the complete conversational turn", async () => {
    const backendResult = {
      status: 201,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          user_message: {
            id: "user-message-1",
            chat_session_id: "chat-session-1",
            role: "user",
            content: "Explain electric flux.",
            provider: null,
            model: null,
            created_at: "2026-08-25T00:00:00Z",
          },
          assistant_message: {
            id: "assistant-message-1",
            chat_session_id: "chat-session-1",
            role: "assistant",
            content: "Electric flux measures field crossing a surface.",
            provider: "ollama",
            model: "gemma4:cloud",
            created_at: "2026-08-25T00:00:01Z",
          },
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
      "http://localhost/api/student/chat-sessions/chat-session-1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Explain electric flux.",
        }),
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        chat_session_id: "chat-session-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/me/chat-sessions/chat-session-1/messages",
      {
        method: "POST",
        body: {
          content: "Explain electric flux.",
        },
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{not-json",
      },
    );

    const response = await POST(request as never, {
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

  it("returns 502 when the chat backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Explain electric flux.",
        }),
      },
    );

    const response = await POST(request as never, {
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

describe("GET /api/student/chat-sessions/[chat_session_id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards pagination when listing chat messages", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          items: [
            {
              id: "message-1",
              chat_session_id: "chat-session-1",
              role: "user",
              content: "What is electric flux?",
              provider: null,
              model: null,
              created_at: "2026-08-25T00:00:00Z",
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
      "http://localhost/api/student/chat-sessions/chat-session-1/messages?page=2&page_size=10",
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
      "/me/chat-sessions/chat-session-1/messages?page=2&page_size=10",
      {
        method: "GET",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(200);
  });

  it("returns 502 when listing chat messages fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/chat-sessions/chat-session-1/messages?page=1&page_size=20",
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
