import { CourseList } from "@/features/student-courses/components/course-list";

export default function StudentCoursesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Courses</h1>

        <p className="mt-1 text-muted-foreground">
          Access your enrolled courses, learning progress, and formative
          assessments.
        </p>
      </div>

      <CourseList />
    </div>
  );
}
