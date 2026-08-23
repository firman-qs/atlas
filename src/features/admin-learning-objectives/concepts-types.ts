import type { AdminConcept } from "@/features/admin-curriculum/types";

export interface AdminLearningObjectiveConcept {
  id: string;
  learning_objective_id: string;
  concept: AdminConcept;
  display_order: number;
  is_required: boolean;
}

export interface UpdateLearningObjectiveConceptSettingsRequest {
  is_required: boolean;
}

export interface ReorderLearningObjectiveConceptsRequest {
  concept_ids: string[];
}
