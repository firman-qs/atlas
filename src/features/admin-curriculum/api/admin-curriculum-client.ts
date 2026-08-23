import type {
  AdminConcept,
  AdminLearningObjective,
  AdminSoloLevel,
} from "@/features/admin-curriculum/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

async function parseResponse<T>(
  response: Response,
  missingDataMessage: string,
): Promise<T> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid curriculum response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (payload.data === null) {
    throw new ApiError(response.status, missingDataMessage, payload);
  }

  return payload.data;
}

export async function listAdminLearningObjectives(
  courseId: string,
): Promise<PaginatedView<AdminLearningObjective>> {
  const params = new URLSearchParams({
    course_id: courseId,
    page: "1",
    page_size: "100",
  });

  const response = await fetch(
    `/api/admin/learning-objectives?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "Learning-objective response did not contain data.",
  );
}

export async function listAdminConcepts(
  courseId: string,
): Promise<PaginatedView<AdminConcept>> {
  const params = new URLSearchParams({
    course_id: courseId,
    page: "1",
    page_size: "100",
  });

  const response = await fetch(`/api/admin/concepts?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse(response, "Concept response did not contain data.");
}

export async function listAdminSoloLevels(): Promise<AdminSoloLevel[]> {
  const response = await fetch("/api/admin/solo-levels", {
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse(response, "SOLO-level response did not contain data.");
}
