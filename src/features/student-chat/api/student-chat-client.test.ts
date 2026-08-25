import { afterEach, describe, expect, it, vi } from "vitest";

import {
  archiveChatSession,
  createChatMessage,
  createChatSession,
  getChatSession,
  listChatMessages,
  listChatSessions,
  updateChatSession,
} from "@/features/student-chat/api/student-chat-client";

describe("student chat client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a conversational turn and returns both user and assistant messages", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: {
            user_message: {
              id: "user-message-1",
              chat_session_id: "chat-session-1",
              role: "user",
              content: "Why does Gauss's law use a closed surface?",
              provider: null,
              model: null,
              created_at: "2026-08-25T00:00:00Z",
            },
            assistant_message: {
              id: "assistant-message-1",
              chat_session_id: "chat-session-1",
              role: "assistant",
              content:
                "Because the law relates net outward electric flux to enclosed charge.",
              provider: "ollama",
              model: "gemma4:cloud",
              created_at: "2026-08-25T00:00:01Z",
            },
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await createChatMessage(
      "chat-session-1",
      "Why does Gauss's law use a closed surface?",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe("/api/student/chat-sessions/chat-session-1/messages");

    expect(init).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    expect(JSON.parse(String(init?.body))).toEqual({
      content: "Why does Gauss's law use a closed surface?",
    });

    expect(result.user_message).toEqual({
      id: "user-message-1",
      chat_session_id: "chat-session-1",
      role: "user",
      content: "Why does Gauss's law use a closed surface?",
      provider: null,
      model: null,
      created_at: "2026-08-25T00:00:00Z",
    });

    expect(result.assistant_message).toEqual({
      id: "assistant-message-1",
      chat_session_id: "chat-session-1",
      role: "assistant",
      content:
        "Because the law relates net outward electric flux to enclosed charge.",
      provider: "ollama",
      model: "gemma4:cloud",
      created_at: "2026-08-25T00:00:01Z",
    });
  });

  it("creates a new chat session for a learning record", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: {
            id: "chat-session-1",
            learning_record_id: "learning-record-1",
            title: "New chat",
            created_at: "2026-08-25T00:00:00Z",
            updated_at: "2026-08-25T00:00:00Z",
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await createChatSession("learning-record-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/learning-records/learning-record-1/chat-sessions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      },
    );

    expect(result).toEqual({
      id: "chat-session-1",
      learning_record_id: "learning-record-1",
      title: "New chat",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:00:00Z",
    });
  });

  it("lists active chat sessions for a learning record", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
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
              {
                id: "chat-session-1",
                learning_record_id: "learning-record-1",
                title: "Electric flux",
                created_at: "2026-08-24T23:00:00Z",
                updated_at: "2026-08-25T00:05:00Z",
                archived_at: null,
              },
            ],
            page: 1,
            page_size: 20,
            total: 2,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await listChatSessions("learning-record-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/learning-records/learning-record-1/chat-sessions?page=1&page_size=20",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    expect(result.total).toBe(2);
    expect(result.items[0].id).toBe("chat-session-2");
    expect(result.items[0].title).toBe("Gauss law discussion");
    expect(result.items[0].archived_at).toBeNull();
  });

  it("gets one active chat session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await getChatSession("chat-session-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/chat-sessions/chat-session-1",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    expect(result).toEqual({
      id: "chat-session-1",
      learning_record_id: "learning-record-1",
      title: "Maxwell equations",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:10:00Z",
      archived_at: null,
    });
  });

  it("lists messages for one chat session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
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
              {
                id: "message-2",
                chat_session_id: "chat-session-1",
                role: "assistant",
                content:
                  "Electric flux measures field passing through a surface.",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:00:05Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 2,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await listChatMessages("chat-session-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/chat-sessions/chat-session-1/messages?page=1&page_size=20",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    expect(result.total).toBe(2);
    expect(result.items[0].role).toBe("user");
    expect(result.items[1].role).toBe("assistant");
    expect(result.items[1].provider).toBe("ollama");
  });

  it("renames a chat session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await updateChatSession(
      "chat-session-1",
      "Maxwell equations review",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/chat-sessions/chat-session-1",
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Maxwell equations review",
        }),
      },
    );

    expect(result.title).toBe("Maxwell equations review");
  });

  it("archives a chat session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await archiveChatSession("chat-session-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/chat-sessions/chat-session-1",
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      },
    );
  });
});
