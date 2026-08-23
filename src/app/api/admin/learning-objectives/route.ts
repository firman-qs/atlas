import { NextRequest, NextResponse } from "next/server";

import type {
  AdminLearningObjective,
  CreateLearningObjectiveRequest,
} from "@/features/admin-learning-objectives/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/learning-objectives?${query}`
      : "/admin/learning-objectives";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminLearningObjective>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS admin learning-objective list request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Learning objective service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: CreateLearningObjectiveRequest;

  try {
    body = (await request.json()) as CreateLearningObjectiveRequest;
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
    const result = await authenticatedBackendRequest<AdminLearningObjective>(
      request,
      "/admin/learning-objectives",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS admin learning-objective creation request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Learning objective service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
