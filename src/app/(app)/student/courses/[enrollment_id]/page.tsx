import { CourseWorkspace } from "@/features/student-course/components/course-workspace";

interface StudentCoursePageProps {
  params: Promise<{
    enrollment_id: string;
  }>;
}

export default async function StudentCoursePage({
  params,
}: StudentCoursePageProps) {
  const { enrollment_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <CourseWorkspace enrollmentId={enrollment_id} />
    </div>
  );
}
