import { NextRequest, NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

import type { MediaPurpose, UploadedMedia } from "@/features/media/types";

function isMediaPurpose(value: string | null): value is MediaPurpose {
  return value === "authoring" || value === "attempt";
}

export async function POST(request: NextRequest) {
  const purpose = request.nextUrl.searchParams.get("purpose");

  if (!purpose) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: "Media purpose is required.",
        data: null,
      },
      {
        status: 400,
      },
    );
  }

  if (!isMediaPurpose(purpose)) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: "Invalid media purpose.",
        data: null,
      },
      {
        status: 400,
      },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: "Invalid multipart request.",
        data: null,
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await authenticatedBackendRequest<UploadedMedia>(
      request,
      `/media?purpose=${purpose}`,
      {
        method: "POST",
        body: formData,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS media upload backend request failed:", error);

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: "Media upload service is unavailable.",
        data: null,
      },
      {
        status: 502,
      },
    );
  }
}
