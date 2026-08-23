import type { AcademicSemester } from "@/features/admin-academic-terms/types";

export interface AdminCourseOfferingCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
}

export interface AdminCourseOfferingInstructor {
  id: string;
  full_name: string;
  email: string;
}

export interface AdminCourseOfferingAcademicTerm {
  id: string;
  year: number;
  semester: AcademicSemester;
  starts_at: string;
  ends_at: string;
}

export interface AdminCourseOffering {
  id: string;
  section: string;
  course: AdminCourseOfferingCourse;
  instructor: AdminCourseOfferingInstructor;
  academic_term: AdminCourseOfferingAcademicTerm;
}

export interface CreateCourseOfferingRequest {
  course_id: string;
  instructor_id: string;
  academic_term_id: string;
  section: string;
}

export interface UpdateCourseOfferingRequest {
  instructor_id?: string;
  section?: string;
}
