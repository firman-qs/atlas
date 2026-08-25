import { NextRequest, NextResponse } from "next/server";

import type {
  ChatMessage,
  CreateChatTurn,
} from "@/features/student-chat/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    chat_session_id: string;
  }>;
}

interface CreateChatMessageRequest {
  content: string;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { chat_session_id } = await context.params;

  let body: CreateChatMessageRequest;

  try {
    body = (await request.json()) as CreateChatMessageRequest;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON request body.",
        data: null,
      },
      { status: 400 },
    );
  }

  try {
    const result = await authenticatedBackendRequest<CreateChatTurn>(
      request,
      `/me/chat-sessions/${chat_session_id}/messages`,
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat message backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Chat service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { chat_session_id } = await context.params;

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.toString();

  const path = query
    ? `/me/chat-sessions/${chat_session_id}/messages?${query}`
    : `/me/chat-sessions/${chat_session_id}/messages`;

  try {
    const result = await authenticatedBackendRequest<
      PaginatedView<ChatMessage>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat message list backend request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Chat service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
