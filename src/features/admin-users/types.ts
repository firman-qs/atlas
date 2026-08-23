export type AdminUserRole = "student" | "instructor" | "admin";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  deleted_at: string | null;
  updated_at: string;
  roles: AdminUserRole[];
}
