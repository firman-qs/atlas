import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ChatMessage,
  ChatSession,
  CreateChatTurn,
} from "@/features/student-chat/types";
import type { PaginatedView } from "@/lib/api/types";

const createChatMessage = vi.hoisted(() => vi.fn());
const updateChatSession = vi.hoisted(() => vi.fn());
const archiveChatSession = vi.hoisted(() => vi.fn());
const listChatMessages = vi.hoisted(() => vi.fn());
const listChatSessions = vi.hoisted(() => vi.fn());

vi.mock("@/features/student-chat/api/student-chat-client", () => ({
  createChatMessage,
  updateChatSession,
  archiveChatSession,
  listChatMessages,
  listChatSessions,
}));

import {
  studentChatKeys,
  useArchiveChatSession,
  useChatMessages,
  useChatSessions,
  useCreateChatMessage,
  useUpdateChatSession,
} from "@/features/student-chat/queries";

type ChatMessageInfiniteData = InfiniteData<PaginatedView<ChatMessage>, number>;

function createTestQueryClient(config?: QueryClientConfig) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
    ...config,
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("student chat queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a completed turn to a cached message page that contains the full conversation", async () => {
    const queryClient = createTestQueryClient();

    const chatSessionId = "chat-session-1";
    const pageSize = 20;

    const existingUserMessage: ChatMessage = {
      id: "message-1",
      chat_session_id: chatSessionId,
      role: "user",
      content: "What is electric flux?",
      provider: null,
      model: null,
      created_at: "2026-08-25T00:00:00Z",
    };

    const existingAssistantMessage: ChatMessage = {
      id: "message-2",
      chat_session_id: chatSessionId,
      role: "assistant",
      content: "Electric flux measures field passing through a surface.",
      provider: "ollama",
      model: "gemma4:cloud",
      created_at: "2026-08-25T00:00:01Z",
    };

    const cachedPage: PaginatedView<ChatMessage> = {
      items: [existingUserMessage, existingAssistantMessage],
      page: 1,
      page_size: pageSize,
      total: 2,
    };

    const cachedMessages: ChatMessageInfiniteData = {
      pages: [cachedPage],
      pageParams: [1],
    };

    queryClient.setQueryData(
      studentChatKeys.messages(chatSessionId, pageSize),
      cachedMessages,
    );

    const generatedTurn: CreateChatTurn = {
      user_message: {
        id: "message-3",
        chat_session_id: chatSessionId,
        role: "user",
        content: "Why does surface orientation matter?",
        provider: null,
        model: null,
        created_at: "2026-08-25T00:01:00Z",
      },

      assistant_message: {
        id: "message-4",
        chat_session_id: chatSessionId,
        role: "assistant",
        content:
          "Because flux depends on the component of the field normal to the surface.",
        provider: "ollama",
        model: "gemma4:cloud",
        created_at: "2026-08-25T00:01:01Z",
      },
    };

    createChatMessage.mockResolvedValue(generatedTurn);

    const learningRecordId = "learning-record-1";

    const { result } = renderHook(
      () => useCreateChatMessage(chatSessionId, learningRecordId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync("Why does surface orientation matter?");
    });

    expect(createChatMessage).toHaveBeenCalledWith(
      chatSessionId,
      "Why does surface orientation matter?",
    );

    const cached = queryClient.getQueryData<ChatMessageInfiniteData>(
      studentChatKeys.messages(chatSessionId, pageSize),
    );

    expect(cached).toEqual({
      pages: [
        {
          items: [
            existingUserMessage,
            existingAssistantMessage,
            generatedTurn.user_message,
            generatedTurn.assistant_message,
          ],
          page: 1,
          page_size: 20,
          total: 4,
        },
      ],
      pageParams: [1],
    });
  });

  it("invalidates message queries when the cached page does not contain the full conversation", async () => {
    const queryClient = createTestQueryClient();

    const chatSessionId = "chat-session-1";
    const pageSize = 2;

    const cachedPage: PaginatedView<ChatMessage> = {
      items: [
        {
          id: "message-1",
          chat_session_id: chatSessionId,
          role: "user",
          content: "What is electric flux?",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:00:00Z",
        },
        {
          id: "message-2",
          chat_session_id: chatSessionId,
          role: "assistant",
          content: "Electric flux measures field crossing a surface.",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:00:01Z",
        },
      ],
      page: 1,
      page_size: pageSize,
      total: 2,
    };

    const cachedMessages: ChatMessageInfiniteData = {
      pages: [cachedPage],
      pageParams: [1],
    };

    queryClient.setQueryData(
      studentChatKeys.messages(chatSessionId, pageSize),
      cachedMessages,
    );

    const generatedTurn: CreateChatTurn = {
      user_message: {
        id: "message-3",
        chat_session_id: chatSessionId,
        role: "user",
        content: "Why does orientation matter?",
        provider: null,
        model: null,
        created_at: "2026-08-25T00:01:00Z",
      },
      assistant_message: {
        id: "message-4",
        chat_session_id: chatSessionId,
        role: "assistant",
        content:
          "Because flux depends on the field component normal to the surface.",
        provider: "ollama",
        model: "gemma4:cloud",
        created_at: "2026-08-25T00:01:01Z",
      },
    };

    createChatMessage.mockResolvedValue(generatedTurn);

    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const learningRecordId = "learning-record-1";

    const { result } = renderHook(
      () => useCreateChatMessage(chatSessionId, learningRecordId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync("Why does orientation matter?");
    });

    const cached = queryClient.getQueryData<ChatMessageInfiniteData>(
      studentChatKeys.messages(chatSessionId, pageSize),
    );

    expect(cached).toEqual(cachedMessages);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...studentChatKeys.all, "messages", chatSessionId],
    });
  });

  it("invalidates chat session metadata after a completed turn", async () => {
    const queryClient = createTestQueryClient();

    const learningRecordId = "learning-record-1";
    const chatSessionId = "chat-session-1";

    const generatedTurn: CreateChatTurn = {
      user_message: {
        id: "message-1",
        chat_session_id: chatSessionId,
        role: "user",
        content: "Explain Gauss's law.",
        provider: null,
        model: null,
        created_at: "2026-08-25T00:00:00Z",
      },

      assistant_message: {
        id: "message-2",
        chat_session_id: chatSessionId,
        role: "assistant",
        content: "Gauss's law relates electric flux to enclosed charge.",
        provider: "ollama",
        model: "gemma4:cloud",
        created_at: "2026-08-25T00:00:01Z",
      },
    };

    createChatMessage.mockResolvedValue(generatedTurn);

    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useCreateChatMessage(chatSessionId, learningRecordId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync("Explain Gauss's law.");
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: studentChatKeys.session(chatSessionId),
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
    });
  });

  it("updates the chat session cache and invalidates its learning-record session lists after rename", async () => {
    const queryClient = createTestQueryClient();

    const learningRecordId = "learning-record-1";
    const chatSessionId = "chat-session-1";

    const existingSession: ChatSession = {
      id: chatSessionId,
      learning_record_id: learningRecordId,
      title: "Maxwell equations",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:10:00Z",
      archived_at: null,
    };

    const renamedSession: ChatSession = {
      ...existingSession,
      title: "Maxwell equations review",
      updated_at: "2026-08-25T00:20:00Z",
    };

    queryClient.setQueryData(
      studentChatKeys.session(chatSessionId),
      existingSession,
    );

    updateChatSession.mockResolvedValue(renamedSession);

    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useUpdateChatSession(chatSessionId, learningRecordId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync("Maxwell equations review");
    });

    expect(updateChatSession).toHaveBeenCalledWith(
      chatSessionId,
      "Maxwell equations review",
    );

    expect(
      queryClient.getQueryData(studentChatKeys.session(chatSessionId)),
    ).toEqual(renamedSession);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
    });
  });

  it("removes archived chat caches and invalidates its learning-record session lists", async () => {
    const queryClient = createTestQueryClient();

    const learningRecordId = "learning-record-1";
    const chatSessionId = "chat-session-1";
    const pageSize = 20;

    queryClient.setQueryData(studentChatKeys.session(chatSessionId), {
      id: chatSessionId,
      learning_record_id: learningRecordId,
      title: "Maxwell equations",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:10:00Z",
      archived_at: null,
    });

    const cachedMessages: ChatMessageInfiniteData = {
      pages: [
        {
          items: [],
          page: 1,
          page_size: pageSize,
          total: 0,
        },
      ],
      pageParams: [1],
    };

    queryClient.setQueryData(
      studentChatKeys.messages(chatSessionId, pageSize),
      cachedMessages,
    );

    archiveChatSession.mockResolvedValue(undefined);

    const removeQueries = vi.spyOn(queryClient, "removeQueries");

    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useArchiveChatSession(chatSessionId, learningRecordId),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(archiveChatSession).toHaveBeenCalledWith(chatSessionId);

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: studentChatKeys.session(chatSessionId),
      exact: true,
    });

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: [...studentChatKeys.all, "messages", chatSessionId],
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
    });

    expect(
      queryClient.getQueryData(studentChatKeys.session(chatSessionId)),
    ).toBeUndefined();

    expect(
      queryClient.getQueryData(
        studentChatKeys.messages(chatSessionId, pageSize),
      ),
    ).toBeUndefined();
  });

  it("loads the newest message page first and fetches older message pages on demand", async () => {
    const queryClient = createTestQueryClient();

    const chatSessionId = "chat-session-1";

    const newestPage: PaginatedView<ChatMessage> = {
      items: [
        {
          id: "message-21",
          chat_session_id: chatSessionId,
          role: "user",
          content: "Newest page user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:20:00Z",
        },
        {
          id: "message-22",
          chat_session_id: chatSessionId,
          role: "assistant",
          content: "Newest page assistant message",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:20:01Z",
        },
      ],
      page: 1,
      page_size: 20,
      total: 22,
    };

    const olderPage: PaginatedView<ChatMessage> = {
      items: [
        {
          id: "message-1",
          chat_session_id: chatSessionId,
          role: "user",
          content: "Older page user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:00:00Z",
        },
      ],
      page: 2,
      page_size: 20,
      total: 22,
    };

    listChatMessages
      .mockResolvedValueOnce(newestPage)
      .mockResolvedValueOnce(olderPage);

    const { result } = renderHook(() => useChatMessages(chatSessionId), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(listChatMessages).toHaveBeenNthCalledWith(1, chatSessionId, 1, 20);

    // Read data before fetching the next page so this
    // observer is subscribed to subsequent data changes.
    expect(result.current.data?.pages).toEqual([newestPage]);

    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(listChatMessages).toHaveBeenNthCalledWith(2, chatSessionId, 2, 20);

    await waitFor(() => {
      expect(result.current.data?.pages).toEqual([newestPage, olderPage]);

      expect(result.current.hasNextPage).toBe(false);
    });
  });

  it("loads the newest chat-session page first and fetches older sessions on demand", async () => {
    const queryClient = createTestQueryClient();

    const learningRecordId = "learning-record-1";

    const newestPage: PaginatedView<ChatSession> = {
      items: [
        {
          id: "chat-session-21",
          learning_record_id: learningRecordId,
          title: "Newest discussion",
          created_at: "2026-08-25T00:20:00Z",
          updated_at: "2026-08-25T00:20:00Z",
          archived_at: null,
        },
        {
          id: "chat-session-22",
          learning_record_id: learningRecordId,
          title: "Another recent discussion",
          created_at: "2026-08-25T00:19:00Z",
          updated_at: "2026-08-25T00:19:00Z",
          archived_at: null,
        },
      ],
      page: 1,
      page_size: 20,
      total: 22,
    };

    const olderPage: PaginatedView<ChatSession> = {
      items: [
        {
          id: "chat-session-1",
          learning_record_id: learningRecordId,
          title: "Older discussion",
          created_at: "2026-08-20T00:00:00Z",
          updated_at: "2026-08-20T00:00:00Z",
          archived_at: null,
        },
      ],
      page: 2,
      page_size: 20,
      total: 22,
    };

    listChatSessions
      .mockResolvedValueOnce(newestPage)
      .mockResolvedValueOnce(olderPage);

    const { result } = renderHook(() => useChatSessions(learningRecordId), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(listChatSessions).toHaveBeenNthCalledWith(
      1,
      learningRecordId,
      1,
      20,
    );

    expect(result.current.data?.pages).toEqual([newestPage]);

    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(listChatSessions).toHaveBeenNthCalledWith(
      2,
      learningRecordId,
      2,
      20,
    );

    await waitFor(() => {
      expect(result.current.data?.pages).toEqual([newestPage, olderPage]);

      expect(result.current.hasNextPage).toBe(false);
    });
  });
});
