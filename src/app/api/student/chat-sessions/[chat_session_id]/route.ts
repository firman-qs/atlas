import { NextRequest, NextResponse } from "next/server";

import type { ChatSession } from "@/features/student-chat/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import {
  authenticatedJsonResponse,
  authenticatedUnitResponse,
} from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    chat_session_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { chat_session_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<ChatSession>(
      request,
      `/me/chat-sessions/${chat_session_id}`,
      {
        method: "GET",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat session detail backend request failed:", error);

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

interface UpdateChatSessionRequest {
  title: string;
}

interface UpdateChatSessionRequest {
  title: string;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { chat_session_id } = await context.params;

  let body: UpdateChatSessionRequest;

  try {
    body = (await request.json()) as UpdateChatSessionRequest;
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
    const result = await authenticatedBackendRequest<ChatSession>(
      request,
      `/me/chat-sessions/${chat_session_id}`,
      {
        method: "PATCH",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat session update backend request failed:", error);

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { chat_session_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<unknown>(
      request,
      `/me/chat-sessions/${chat_session_id}`,
      {
        method: "DELETE",
      },
    );

    return authenticatedUnitResponse(result);
  } catch (error) {
    console.error("ATLAS chat session archive backend request failed:", error);

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
