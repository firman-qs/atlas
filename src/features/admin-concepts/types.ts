export type { AdminConcept } from "@/features/admin-curriculum/types";

export interface CreateConceptRequest {
  course_id: string;
  code: string;
  name: string;
  description: string;
}

export interface UpdateConceptRequest {
  code?: string;
  name?: string;
  description?: string;
}
