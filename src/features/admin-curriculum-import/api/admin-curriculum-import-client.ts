import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse } from "@/lib/api/types";

import type { ImportCurriculumResult } from "@/features/admin-curriculum-import/types";

export async function importCurriculum(
  file: File,
): Promise<ImportCurriculumResult> {
  const formData = new FormData();

  formData.append("curriculum", file);

  const response = await fetch("/api/admin/import-curriculum", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  let payload: ApiResponse<ImportCurriculumResult>;

  try {
    payload = (await response.json()) as ApiResponse<ImportCurriculumResult>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid curriculum-import response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Curriculum-import response did not contain import statistics.",
      payload,
    );
  }

  return payload.data;
}
