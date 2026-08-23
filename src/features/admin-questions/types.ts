export type AdminQuestionType = "mcq" | "essay";

export type AdminQuestionStatus = "draft" | "published";

export interface AdminMcqOption {
  id: string;
  text: string;
  is_correct: boolean;
  display_order: number;
}

export interface AdminMcqQuestionContent {
  type: "mcq";
  is_option_shuffled: boolean;
  options: AdminMcqOption[];
}

export interface AdminEssayQuestionContent {
  type: "essay";
  rubric: string;
  ideal_answer: string;
}

export type AdminQuestionContent =
  | AdminMcqQuestionContent
  | AdminEssayQuestionContent;

export interface AdminQuestionSummary {
  id: string;
  learning_objective_id: string;
  concept_id: string;
  solo_level_id: string;
  question_type: AdminQuestionType;
  status: AdminQuestionStatus;
  prompt: string;
  feedback: string | null;
  ai_guidelines: string | null;
  content: AdminQuestionContent;
}

export interface CreateAdminMcqOptionRequest {
  text: string;
  is_correct: boolean;
  display_order: number;
}

interface CreateAdminQuestionCommonRequest {
  learning_objective_id: string;
  concept_id: string;
  solo_level_id: string;

  prompt: string;
  feedback: string | null;
  ai_guidelines: string | null;
}

export interface CreateAdminMcqQuestionRequest extends CreateAdminQuestionCommonRequest {
  type: "mcq";
  is_option_shuffled: boolean;
  options: CreateAdminMcqOptionRequest[];
}

export interface CreateAdminEssayQuestionRequest extends CreateAdminQuestionCommonRequest {
  type: "essay";
  rubric: string;
  ideal_answer: string;
}

export type CreateAdminQuestionRequest =
  | CreateAdminMcqQuestionRequest
  | CreateAdminEssayQuestionRequest;

export interface UpdateAdminMcqQuestionRequest {
  prompt?: string;
  feedback?: string | null;
  ai_guidelines?: string | null;

  type: "mcq";
  is_option_shuffled?: boolean;
  options?: CreateAdminMcqOptionRequest[];
}

export interface UpdateAdminEssayQuestionRequest {
  prompt?: string;
  feedback?: string | null;
  ai_guidelines?: string | null;

  type: "essay";
  rubric?: string;
  ideal_answer?: string;
}

export interface UpdateAdminQuestionCommonRequest {
  prompt?: string;
  feedback?: string | null;
  ai_guidelines?: string | null;
}

export type UpdateAdminQuestionRequest =
  | UpdateAdminQuestionCommonRequest
  | UpdateAdminMcqQuestionRequest
  | UpdateAdminEssayQuestionRequest;
