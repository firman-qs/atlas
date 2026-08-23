import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

import type {
  AdminUser,
  AdminUserRole,
} from "@/features/admin-users/types";

export interface ListAdminUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

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
      "ATLAS returned an invalid user response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(response.status, missingDataMessage, payload);
  }

  return payload.data;
}

async function parseUnitResponse(response: Response): Promise<void> {
  if (response.status === 204) {
    return;
  }

  let payload: ApiResponse<unknown>;

  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid user response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listAdminUsers(
  params: ListAdminUsersParams = {},
): Promise<PaginatedView<AdminUser>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search !== undefined && params.search.trim() !== "") {
    searchParams.set("search", params.search.trim());
  }

  if (params.isActive !== undefined) {
    searchParams.set("is_active", String(params.isActive));
  }

  const query = searchParams.toString();

  const response = await fetch(
    query ? `/api/admin/users?${query}` : "/api/admin/users",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseResponse(
    response,
    "User response did not contain user data.",
  );
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse(
    response,
    "User response did not contain user data.",
  );
}

export async function assignAdminUserRole(
  userId: string,
  role: AdminUserRole,
): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${userId}/roles/${role}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}

export async function removeAdminUserRole(
  userId: string,
  role: AdminUserRole,
): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${userId}/roles/${role}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  return parseUnitResponse(response);
}
