export interface AdminCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  is_active: boolean;
}

export interface CreateCourseRequest {
  code: string;
  title: string;
  description: string;
  credits: number;
}

export interface UpdateCourseRequest {
  code?: string;
  title?: string;
  description?: string;
  credits?: number;
}

export type AdminCourseSortField = "code" | "title" | "credits";
export type SortOrder = "asc" | "desc";
