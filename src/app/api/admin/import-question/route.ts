import { NextRequest, NextResponse } from "next/server";

import type { ImportQuestionResult } from "@/features/admin-question-import/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid multipart request.",
        data: null,
      },
      { status: 400 },
    );
  }

  try {
    const result = await authenticatedBackendRequest<ImportQuestionResult>(
      request,
      "/admin/import-question",
      {
        method: "POST",
        body: formData,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS question import request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Question import service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
