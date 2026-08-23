import { AdminCourseDetail } from "@/features/admin-courses/components/admin-course-detail";

interface AdminCourseDetailPageProps {
  params: Promise<{
    course_id: string;
  }>;
}

export default async function AdminCourseDetailPage({
  params,
}: AdminCourseDetailPageProps) {
  const { course_id } = await params;

  return <AdminCourseDetail courseId={course_id} />;
}
