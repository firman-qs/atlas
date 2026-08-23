import "server-only";

import type { ApiResponse } from "@/lib/api/types";
import { env } from "@/lib/config/env";

interface BackendRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  bearerToken?: string;
}

export interface BackendResponse<T> {
  status: number;
  ok: boolean;
  payload: ApiResponse<T> | null;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function backendRequest<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<BackendResponse<T>> {
  const {
    body,
    bearerToken,
    headers: initialHeaders,
    ...requestInit
  } = options;

  const headers = new Headers(initialHeaders);

  headers.set("Accept", "application/json");

  const multipartBody = isFormData(body);

  if (body !== undefined && !multipartBody) {
    headers.set("Content-Type", "application/json");
  }

  if (bearerToken) {
    headers.set("Authorization", `Bearer ${bearerToken}`);
  }

  const requestBody =
    body === undefined
      ? undefined
      : multipartBody
        ? body
        : JSON.stringify(body);

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...requestInit,
    headers,
    body: requestBody,
    cache: "no-store",
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // Keep null. The caller will treat this as an invalid backend response.
  }

  return {
    status: response.status,
    ok: response.ok,
    payload,
  };
}
