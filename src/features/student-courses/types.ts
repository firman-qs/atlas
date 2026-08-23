export type AssessmentMode = "progress" | "review";

export type AssessmentStatus = "created" | "running" | "completed" | "canceled";

export interface StudentActiveAssessmentSummary {
  id: string;
  learning_objective_id: string;
  mode: AssessmentMode;
  status: AssessmentStatus;
}

export interface StudentLearningRecordSummary {
  id: string;
  started_at: string;
  completed_at: string | null;
  active_assessment: StudentActiveAssessmentSummary | null;
}

export interface CourseOfferingCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
}

export interface CourseOfferingInstructor {
  id: string;
  full_name: string;
  email: string;
}

export interface CourseOfferingAcademicTerm {
  id: string;
  year: number;
  semester: string;
  starts_at: string;
  ends_at: string;
}

export interface StudentCourseOffering {
  id: string;
  section: string;
  course: CourseOfferingCourse;
  instructor: CourseOfferingInstructor;
  academic_term: CourseOfferingAcademicTerm;
}

export interface StudentEnrollment {
  id: string;
  enrolled_at: string;
  course_offering: StudentCourseOffering;
  learning_record: StudentLearningRecordSummary | null;
}
