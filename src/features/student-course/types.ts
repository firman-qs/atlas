export type AssessmentMode = "progress" | "review";

export type AssessmentStatus = "created" | "running" | "completed" | "canceled";

export interface LearningRecordProgress {
  learning_record_id: string;
  completed_at: string | null;
  learning_objectives: LearningObjectiveProgress[];
}

export interface LearningObjectiveProgress {
  id: string;
  code: string;
  description: string;
  display_order: number;
  mastered_at: string | null;
  concepts: LearningObjectiveConceptProgress[];
}

export interface LearningObjectiveConceptProgress {
  learning_objective_concept_id: string;
  concept: ProgressConcept;
  is_required: boolean;
  display_order: number;
  mastered_loc_level_id: string | null;
  mastered_at: string | null;
  levels: ProgressSoloLevel[];
}

export interface ProgressConcept {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface ProgressSoloLevel {
  loc_level_id: string;
  solo_level: SoloLevel;
  mastery_threshold: number;
  display_order: number;
}

export interface SoloLevel {
  id: string;
  code: string;
  level: number;
  description: string;
}

export interface AssessmentOptions {
  learning_record_id: string;
  active_assessment: ActiveAssessmentOption | null;
  progress: ProgressAssessmentOption | null;
  review: ReviewLearningObjectiveOption[];
}

export interface ActiveAssessmentOption {
  id: string;
  learning_objective_id: string;
  mode: AssessmentMode;
  status: AssessmentStatus;
}

export interface AssessmentOptionLearningObjective {
  id: string;
  code: string;
  description: string;
  display_order: number;
}

export interface ProgressAssessmentOption {
  learning_objective: AssessmentOptionLearningObjective;
}

export interface ReviewLearningObjectiveOption {
  learning_objective: AssessmentOptionLearningObjective;
  can_review_learning_objective: boolean;
  concepts: ReviewConceptOption[];
}

export interface ReviewConceptOption {
  learning_objective_concept_id: string;
  concept: AssessmentOptionConcept;
  can_review_concept: boolean;
  mastered_levels: ReviewLevelOption[];
}

export interface AssessmentOptionConcept {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface ReviewLevelOption {
  loc_level_id: string;
  solo_level_id: string;
  solo_code: string;
  solo_level: number;
  display_order: number;
}

export type ReviewTarget =
  | {
      scope: "learning_objective";
    }
  | {
      scope: "concept";
      learning_objective_concept_id: string;
    }
  | {
      scope: "level";
      learning_objective_concept_id: string;
      loc_level_id: string;
    };

export interface CreateAssessmentRequest {
  learning_objective_id: string;
  question_bank_id: string | null;
  mode: AssessmentMode;
  review_target: ReviewTarget | null;
}

export interface CreatedAssessment {
  id: string;
  learning_record_id: string;
  learning_objective_id: string;
  question_bank_id: string | null;
  review_learning_objective_concept_id: string | null;
  review_loc_level_id: string | null;
  current_loc_level_id: string | null;
  mode: AssessmentMode;
  status: AssessmentStatus;
  started_at: string | null;
  completed_at: string | null;
}

export interface AssessmentState {
  id: string;
  learning_record_id: string;
  learning_objective_id: string;

  question_bank_id: string | null;

  review_learning_objective_concept_id: string | null;
  review_loc_level_id: string | null;

  mode: AssessmentMode;
  status: AssessmentStatus;

  current_loc_level_id: string | null;
  current_question_id: string | null;
  current_cycle_number: number | null;

  started_at: string | null;
  completed_at: string | null;
}

export interface AssessmentLearningObjective {
  id: string;
  course_id: string;
  code: string;
  description: string;
  display_order: number;
}

export interface Assessment {
  id: string;
  learning_record_id: string;

  learning_objective: AssessmentLearningObjective;

  question_bank_id: string | null;
  review_learning_objective_concept_id: string | null;
  review_loc_level_id: string | null;

  mode: "progress" | "review";
  status: "created" | "running" | "completed" | "canceled";

  current_loc_level_id: string | null;
  current_question_id: string | null;
  current_cycle_number: number | null;

  started_at: string | null;
  completed_at: string | null;
}

export interface AssessmentMcqOption {
  id: string;
  option_text: string;
}

export type AssessmentQuestionContent =
  | {
      type: "mcq";
      options: AssessmentMcqOption[];
    }
  | {
      type: "essay";
    };

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  content: AssessmentQuestionContent;
}

export type SubmitAttemptAnswer =
  | {
      option_id: string;
    }
  | {
      text: string;
    };

export interface SubmitAttemptRequest {
  answer: SubmitAttemptAnswer;
}

export interface SubmitAttemptResult {
  attempt_id: string;
  question_id: string;
  cycle_number: number;

  is_correct: boolean | null;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;

  cycle_completed: boolean;
  cycle_score: number | null;
  mastery_threshold: number;
  level_mastered: boolean;

  assessment_status: "created" | "running" | "completed" | "canceled";
  current_loc_level_id: string | null;
}

export interface AssessmentResultQuestionBank {
  id: string;
  code: string;
  name: string;
}

export type AssessmentResultReviewTarget =
  | {
      scope: "learning_objective";
    }
  | {
      scope: "concept";
      learning_objective_concept_id: string;
    }
  | {
      scope: "level";
      learning_objective_concept_id: string;
      loc_level_id: string;
    };

export interface AssessmentResultLearningObjective {
  id: string;
  code: string;
  description: string;
}

export interface AssessmentResultMcqOption {
  id: string;
  text: string;
}

export type AssessmentResultQuestionContent =
  | {
      type: "mcq";
      options: AssessmentResultMcqOption[];
    }
  | {
      type: "essay";
    };

export interface AssessmentResultMcqAnswer {
  option_id: string;
}

export interface AssessmentResultEssayAnswer {
  text: string;
}

export type AssessmentResultAnswer =
  | AssessmentResultMcqAnswer
  | AssessmentResultEssayAnswer;

export interface AssessmentResultAttempt {
  attempt_id: string;
  question_id: string;
  question_type: "mcq" | "essay";
  question_content: AssessmentResultQuestionContent;
  prompt: string;
  answer: AssessmentResultAnswer;
  is_correct: boolean | null;
  score: number | null;
  feedback: string | null;
  evaluation_metadata: unknown | null;
  submitted_at: string;
  evaluated_at: string | null;
}

export interface AssessmentResultCycle {
  cycle_number: number;
  score: number | null;
  mastery_threshold: number | null;
  passed: boolean | null;
  completed_at: string | null;
  attempts: AssessmentResultAttempt[];
}

export interface AssessmentResultLevel {
  loc_level_id: string;
  solo_level_id: string;
  solo_code: string;
  solo_level: number;
  display_order: number;
  cycles: AssessmentResultCycle[];
}

export interface AssessmentResultConcept {
  learning_objective_concept_id: string;
  concept_id: string;
  concept_code: string;
  concept_name: string;
  display_order: number;
  levels: AssessmentResultLevel[];
}

export interface AssessmentResult {
  assessment_id: string;
  mode: AssessmentMode;
  status: AssessmentStatus;
  question_bank: AssessmentResultQuestionBank | null;
  review_target: AssessmentResultReviewTarget | null;
  started_at: string | null;
  completed_at: string | null;
  learning_objective: AssessmentResultLearningObjective;
  total_attempts: number;
  concepts: AssessmentResultConcept[];
}

export interface StudentQuestionBank {
  id: string;
  code: string;
  name: string;
  description: string | null;
}
