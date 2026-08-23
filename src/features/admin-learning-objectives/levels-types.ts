import type { AdminSoloLevel } from "@/features/admin-curriculum/types";

export interface AdminLearningObjectiveConceptLevel {
  id: string;
  learning_objective_concept_id: string;
  solo_level: AdminSoloLevel;
  mastery_threshold: number;
  display_order: number;
}

export interface AddLearningObjectiveConceptLevelRequest {
  solo_level_id: string;
  mastery_threshold: number;
}

export interface UpdateLearningObjectiveConceptLevelRequest {
  mastery_threshold: number;
}

export interface ReorderLearningObjectiveConceptLevelsRequest {
  solo_level_ids: string[];
}
