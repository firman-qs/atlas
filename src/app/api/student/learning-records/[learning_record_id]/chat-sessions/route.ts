import { NextRequest, NextResponse } from "next/server";

import type {
  ChatSession,
  CreatedChatSession,
} from "@/features/student-chat/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    learning_record_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { learning_record_id } = await context.params;

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.toString();

  const path = query
    ? `/me/learning-records/${learning_record_id}/chat-sessions?${query}`
    : `/me/learning-records/${learning_record_id}/chat-sessions`;

  try {
    const result = await authenticatedBackendRequest<
      PaginatedView<ChatSession>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat session list backend request failed:", error);

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

export async function POST(request: NextRequest, context: RouteContext) {
  const { learning_record_id } = await context.params;

  try {
    const result = await authenticatedBackendRequest<CreatedChatSession>(
      request,
      `/me/learning-records/${learning_record_id}/chat-sessions`,
      {
        method: "POST",
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS chat session creation backend request failed:", error);

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
