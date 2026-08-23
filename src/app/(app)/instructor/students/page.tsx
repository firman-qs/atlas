import { InstructorStudentList } from "@/features/instructor-students/components/instructor-student-list";

export default function InstructorStudentsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>

        <p className="mt-1 text-muted-foreground">
          Browse active student accounts available for instructor-managed
          enrollment.
        </p>
      </div>

      <InstructorStudentList />
    </div>
  );
}
