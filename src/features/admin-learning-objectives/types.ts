export interface AdminLearningObjective {
  id: string;
  course_id: string;
  code: string;
  description: string;
  display_order: number;
}

export interface CreateLearningObjectiveRequest {
  course_id: string;
  code: string;
  description: string;
}

export interface UpdateLearningObjectiveRequest {
  code?: string;
  description?: string;
}

export interface ReorderLearningObjectivesRequest {
  learning_objective_ids: string[];
}
