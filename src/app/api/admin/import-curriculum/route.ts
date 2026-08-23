import { NextRequest, NextResponse } from "next/server";

import type { ImportCurriculumResult } from "@/features/admin-curriculum-import/types";
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
    const result = await authenticatedBackendRequest<ImportCurriculumResult>(
      request,
      "/admin/import-curriculum",
      {
        method: "POST",
        body: formData,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS curriculum import request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Curriculum import service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
