import type {
  ChatMessage,
  ChatSession,
  CreateChatTurn,
  CreatedChatSession,
} from "@/features/student-chat/types";

import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.status, "ATLAS returned an invalid response.");
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "ATLAS response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function createChatMessage(
  chatSessionId: string,
  content: string,
): Promise<CreateChatTurn> {
  const response = await fetch(
    `/api/student/chat-sessions/${chatSessionId}/messages`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    },
  );

  return parseResponse<CreateChatTurn>(response);
}

export async function createChatSession(
  learningRecordId: string,
): Promise<CreatedChatSession> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/chat-sessions`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<CreatedChatSession>(response);
}

export async function listChatSessions(
  learningRecordId: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedView<ChatSession>> {
  const response = await fetch(
    `/api/student/learning-records/${learningRecordId}/chat-sessions?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<PaginatedView<ChatSession>>(response);
}

export async function getChatSession(
  chatSessionId: string,
): Promise<ChatSession> {
  const response = await fetch(`/api/student/chat-sessions/${chatSessionId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse<ChatSession>(response);
}

export async function listChatMessages(
  chatSessionId: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedView<ChatMessage>> {
  const response = await fetch(
    `/api/student/chat-sessions/${chatSessionId}/messages?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse<PaginatedView<ChatMessage>>(response);
}

export async function updateChatSession(
  chatSessionId: string,
  title: string,
): Promise<ChatSession> {
  const response = await fetch(`/api/student/chat-sessions/${chatSessionId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  return parseResponse<ChatSession>(response);
}

export async function archiveChatSession(chatSessionId: string): Promise<void> {
  const response = await fetch(`/api/student/chat-sessions/${chatSessionId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  let payload: ApiResponse<unknown>;

  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError(response.status, "ATLAS returned an invalid response.");
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}
