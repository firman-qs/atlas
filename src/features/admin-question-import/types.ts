import type { AdminQuestionType } from "@/features/admin-questions/types";

export interface SkippedQuestion {
  learning_objective_code: string;
  concept_code: string;
  solo_code: string;
  question_type: AdminQuestionType;
  prompt: string;
  reason: string;
}

export interface ImportQuestionResult {
  inserted: number;
  skipped: number;
  skipped_questions: SkippedQuestion[];
}
