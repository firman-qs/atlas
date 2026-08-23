export type AcademicSemester =
  | "odd"
  | "even"
  | "ganjil"
  | "genap"
  | "antara"
  | "spring"
  | "fall"
  | "summer";

export interface AdminAcademicTerm {
  id: string;
  year: number;
  semester: AcademicSemester;
  starts_at: string;
  ends_at: string;
}

export interface CreateAcademicTermRequest {
  year: number;
  semester: AcademicSemester;
  starts_at: string;
  ends_at: string;
}

export interface UpdateAcademicTermRequest {
  year?: number;
  semester?: AcademicSemester;
  starts_at?: string;
  ends_at?: string;
}
