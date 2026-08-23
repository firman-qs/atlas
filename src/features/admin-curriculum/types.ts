export interface AdminLearningObjective {
  id: string;
  course_id: string;
  code: string;
  description: string;
  display_order: number;
}

export interface AdminConcept {
  id: string;
  course_id: string;
  code: string;
  name: string;
  description: string;
}

export interface AdminSoloLevel {
  id: string;
  code: string;
  level: number;
  description: string;
}

export interface AdminLearningObjectiveConcept {
  id: string;
  learning_objective_id: string;
  concept: AdminConcept;
  display_order: number;
  is_required: boolean;
}
