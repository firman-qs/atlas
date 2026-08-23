import { NextRequest, NextResponse } from "next/server";

import type {
  AdminConcept,
  CreateConceptRequest,
} from "@/features/admin-concepts/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query ? `/admin/concepts?${query}` : "/admin/concepts";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminConcept>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin concept list request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: CreateConceptRequest;

  try {
    body = (await request.json()) as CreateConceptRequest;
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
    const result = await authenticatedBackendRequest<AdminConcept>(
      request,
      "/admin/concepts",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin concept creation request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Concept service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
