import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse } from "@/lib/api/types";

import type { ImportQuestionResult } from "@/features/admin-question-import/types";

export async function importQuestions(
  file: File,
): Promise<ImportQuestionResult> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/admin/import-question", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  let payload: ApiResponse<ImportQuestionResult>;

  try {
    payload = (await response.json()) as ApiResponse<ImportQuestionResult>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid question-import response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Question-import response did not contain import statistics.",
      payload,
    );
  }

  return payload.data;
}
