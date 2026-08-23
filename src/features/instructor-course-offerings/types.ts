export interface InstructorCourseOfferingCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
}

export interface InstructorCourseOfferingInstructor {
  id: string;
  full_name: string;
  email: string;
}

export interface InstructorCourseOfferingAcademicTerm {
  id: string;
  year: number;
  semester: string;
  starts_at: string;
  ends_at: string;
}

export interface InstructorCourseOffering {
  id: string;
  section: string;
  course: InstructorCourseOfferingCourse;
  instructor: InstructorCourseOfferingInstructor;
  academic_term: InstructorCourseOfferingAcademicTerm;
}

export interface InstructorEnrollmentStudent {
  id: string;
  full_name: string;
  email: string;
}

export interface InstructorLearningRecordSummary {
  id: string;
  started_at: string;
  completed_at: string | null;
}

export interface InstructorEnrollment {
  id: string;
  enrolled_at: string;
  student: InstructorEnrollmentStudent;
  learning_record: InstructorLearningRecordSummary | null;
}

export interface CreateInstructorEnrollmentRequest {
  student_id: string;
}

export interface CreatedInstructorEnrollment {
  id: string;
  student_id: string;
  course_offering_id: string;
  enrolled_at: string;
}
