import type { AcademicSemester } from "@/features/admin-academic-terms/types";

export const academicSemesterOptions = [
  {
    value: "odd",
    label: "Odd",
  },
  {
    value: "even",
    label: "Even",
  },
  {
    value: "ganjil",
    label: "Ganjil",
  },
  {
    value: "genap",
    label: "Genap",
  },
  {
    value: "antara",
    label: "Antara",
  },
  {
    value: "spring",
    label: "Spring",
  },
  {
    value: "fall",
    label: "Fall",
  },
  {
    value: "summer",
    label: "Summer",
  },
] as const satisfies ReadonlyArray<{
  value: AcademicSemester;
  label: string;
}>;

export function formatAcademicSemester(semester: AcademicSemester) {
  return (
    academicSemesterOptions.find((option) => option.value === semester)
      ?.label ?? semester
  );
}

export function isAcademicSemester(
  value: string | null,
): value is AcademicSemester {
  return academicSemesterOptions.some((option) => option.value === value);
}
