import { NextRequest, NextResponse } from "next/server";

import type {
  AdminAcademicTerm,
  CreateAcademicTermRequest,
} from "@/features/admin-academic-terms/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/admin/academic-terms?${query}`
      : "/admin/academic-terms";

    const result = await authenticatedBackendRequest<
      PaginatedView<AdminAcademicTerm>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS academic-term list request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Academic term service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateAcademicTermRequest;

    const result = await authenticatedBackendRequest<AdminAcademicTerm>(
      request,
      "/admin/academic-terms",
      {
        method: "POST",
        body,
      },
    );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error("ATLAS academic-term creation request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Academic term service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
