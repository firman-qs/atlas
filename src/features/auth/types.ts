export type UserRole = "admin" | "instructor" | "student";

export interface User {
  id: string;
  email: string;
  full_name: string;
  updated_at: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface BackendLoginView {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface JwtRefreshResult {
  access_token: string;
  refresh_token: string;
}

export interface Me {
  user: User;
  roles: UserRole[];
}
