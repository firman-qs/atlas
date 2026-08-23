export interface InstructorLearningRecordCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
}

export interface InstructorLearningRecordInstructor {
  id: string;
  full_name: string;
  email: string;
}

export interface InstructorLearningRecordAcademicTerm {
  id: string;
  year: number;
  semester: string;
  starts_at: string;
  ends_at: string;
}

export interface InstructorLearningRecordCourseOffering {
  id: string;
  section: string;
  course: InstructorLearningRecordCourse;
  instructor: InstructorLearningRecordInstructor;
  academic_term: InstructorLearningRecordAcademicTerm;
}

export interface InstructorLearningRecordStudent {
  id: string;
  full_name: string;
  email: string;
}

export interface InstructorLearningRecordEnrollment {
  id: string;
  enrolled_at: string;
  student: InstructorLearningRecordStudent;
  course_offering: InstructorLearningRecordCourseOffering;
}

export interface InstructorLearningRecord {
  id: string;
  started_at: string;
  completed_at: string | null;
  enrollment: InstructorLearningRecordEnrollment;
}

export interface InstructorLearningRecordProgress {
  learning_record_id: string;
  completed_at: string | null;
  learning_objectives: InstructorLearningObjectiveProgress[];
}

export interface InstructorLearningObjectiveProgress {
  id: string;
  code: string;
  description: string;
  display_order: number;
  mastered_at: string | null;
  concepts: InstructorLearningObjectiveConceptProgress[];
}

export interface InstructorLearningObjectiveConceptProgress {
  learning_objective_concept_id: string;
  concept: InstructorProgressConcept;
  is_required: boolean;
  display_order: number;
  mastered_loc_level_id: string | null;
  mastered_at: string | null;
  levels: InstructorProgressSoloLevel[];
}

export interface InstructorProgressConcept {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface InstructorProgressSoloLevel {
  loc_level_id: string;
  solo_level: InstructorSoloLevel;
  mastery_threshold: number;
  display_order: number;
}

export interface InstructorSoloLevel {
  id: string;
  code: string;
  level: number;
  description: string;
}

export type InstructorAssessmentMode = "progress" | "review";

export type InstructorAssessmentStatus =
  | "created"
  | "running"
  | "completed"
  | "canceled";

export interface InstructorAssessmentLearningObjective {
  id: string;
  course_id: string;
  code: string;
  description: string;
  display_order: number;
}

export interface InstructorAssessment {
  id: string;
  learning_record_id: string;
  learning_objective: InstructorAssessmentLearningObjective;
  question_bank_id: string | null;
  review_learning_objective_concept_id: string | null;
  review_loc_level_id: string | null;
  mode: InstructorAssessmentMode;
  status: InstructorAssessmentStatus;
  current_loc_level_id: string | null;
  current_question_id: string | null;
  current_cycle_number: number | null;
  started_at: string | null;
  completed_at: string | null;
}
