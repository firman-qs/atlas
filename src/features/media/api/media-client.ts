import type { MediaPurpose, UploadedMedia } from "@/features/media/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse } from "@/lib/api/types";

export async function uploadMedia(
  file: File,
  purpose: MediaPurpose,
): Promise<UploadedMedia> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `/api/media?purpose=${encodeURIComponent(purpose)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    },
  );

  let payload: ApiResponse<UploadedMedia>;

  try {
    payload = (await response.json()) as ApiResponse<UploadedMedia>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid media-upload response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Media-upload response did not contain media metadata.",
      payload,
    );
  }

  return payload.data;
}

export function mediaUrl(mediaId: string): string {
  return `/api/media/${encodeURIComponent(mediaId)}`;
}
