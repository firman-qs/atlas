import { AdminCourseOfferingDetail } from "@/features/admin-course-offerings/components/admin-course-offering-detail";

interface AdminCourseOfferingPageProps {
  params: Promise<{
    course_offering_id: string;
  }>;
}

export default async function AdminCourseOfferingPage({
  params,
}: AdminCourseOfferingPageProps) {
  const { course_offering_id } = await params;

  return <AdminCourseOfferingDetail courseOfferingId={course_offering_id} />;
}
