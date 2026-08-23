export interface ImportStats {
  inserted: number;
  skipped: number;
}

export interface ImportCurriculumResult {
  course: ImportStats;
  learning_objectives: ImportStats;
  concepts: ImportStats;
  learning_objective_concepts: ImportStats;
  learning_objective_concept_levels: ImportStats;
}
