import { NextRequest, NextResponse } from "next/server";

import type {
  CreatedInstructorEnrollment,
  CreateInstructorEnrollmentRequest,
  InstructorEnrollment,
} from "@/features/instructor-course-offerings/types";
import type { PaginatedView } from "@/lib/api/types";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { authenticatedJsonResponse } from "@/lib/auth/authenticated-response";

interface RouteContext {
  params: Promise<{
    course_offering_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { course_offering_id } = await context.params;

  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const query = searchParams.toString();

    const path = query
      ? `/me/course-offerings/${course_offering_id}/enrollments?${query}`
      : `/me/course-offerings/${course_offering_id}/enrollments`;

    const result = await authenticatedBackendRequest<
      PaginatedView<InstructorEnrollment>
    >(request, path, {
      method: "GET",
    });

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor course-offering enrollment request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Enrollment service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { course_offering_id } = await context.params;

  let body: CreateInstructorEnrollmentRequest;

  try {
    body = (await request.json()) as CreateInstructorEnrollmentRequest;
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
    const result =
      await authenticatedBackendRequest<CreatedInstructorEnrollment>(
        request,
        `/me/course-offerings/${course_offering_id}/enrollments`,
        {
          method: "POST",
          body,
        },
      );

    return authenticatedJsonResponse(result);
  } catch (error) {
    console.error(
      "ATLAS instructor enrollment creation request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Enrollment service is unavailable.",
        data: null,
      },
      { status: 502 },
    );
  }
}
