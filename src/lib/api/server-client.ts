import "server-only";

import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string;
};

export async function serverApi<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, accessToken, headers: initialHeaders, ...init } = options;

  const headers = new Headers(initialHeaders);

  headers.set("Accept", "application/json");

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // The backend unexpectedly returned a non-JSON response.
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ??
        `ATLAS API request failed with status ${response.status}.`,
      payload,
    );
  }

  if (!payload) {
    throw new ApiError(
      response.status,
      "ATLAS API returned an invalid response.",
    );
  }

  if (!payload.success) {
    throw new ApiError(
      response.status,
      payload.message ?? "ATLAS API request was unsuccessful.",
      payload,
    );
  }

  return payload.data as T;
}
