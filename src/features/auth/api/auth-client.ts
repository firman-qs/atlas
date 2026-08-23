import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  Me,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/features/auth/types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse } from "@/lib/api/types";

interface LoginResult {
  user: User;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.status, "ATLAS returned an invalid response.");
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  return payload;
}

export async function register(request: RegisterRequest): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<User>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Registration succeeded without user data.",
      payload,
    );
  }

  return payload.data;
}

export async function login(request: LoginRequest): Promise<LoginResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<LoginResult>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Login succeeded without user data.",
      payload,
    );
  }

  return payload.data;
}

export async function getSession(): Promise<Me | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await parseResponse<Me>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Session response did not contain user data.",
      payload,
    );
  }

  return payload.data;
}

export async function changePassword(
  request: ChangePasswordRequest,
): Promise<string> {
  const response = await fetch("/api/auth/change-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<string>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Password-change response did not contain confirmation data.",
      payload,
    );
  }

  return payload.data;
}

export async function forgotPassword(
  request: ForgotPasswordRequest,
): Promise<string> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<string>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Password-reset response did not contain a message.",
      payload,
    );
  }

  return payload.data;
}

export async function resetPassword(
  request: ResetPasswordRequest,
): Promise<string> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const payload = await parseResponse<string>(response);

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Password reset succeeded without a response message.",
      payload,
    );
  }

  return payload.data;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  await parseResponse<null>(response);
}
