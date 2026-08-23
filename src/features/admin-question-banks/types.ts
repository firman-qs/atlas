export interface QuestionBank {
  id: string;
  course_id: string;
  code: string;
  name: string;
  description: string | null;
  is_student_selectable: boolean;
}

export interface CreateQuestionBankRequest {
  course_id: string;
  code: string;
  name: string;
  description: string | null;
  is_student_selectable: boolean;
}

export interface QuestionBankQuestion {
  id: string;
  concept_level_id: string;
  learning_objective_id: string;
  concept_id: string;
  solo_level_id: string;
  question_type: "mcq" | "essay";
  status: "draft" | "published";
  prompt: string;
}

export interface AdminQuestionSummary {
  id: string;
  learning_objective_id: string;
  concept_id: string;
  solo_level_id: string;
  question_type: "mcq" | "essay";
  status: "draft" | "published";
  prompt: string;
  feedback: string | null;
  ai_guidelines: string | null;
}

export interface UpdateQuestionBankRequest {
  code?: string;
  name?: string;
  description?: string | null;
  is_student_selectable?: boolean;
}
