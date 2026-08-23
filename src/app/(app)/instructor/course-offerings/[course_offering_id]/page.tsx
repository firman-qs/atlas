import { InstructorCourseOfferingDetail } from "@/features/instructor-course-offerings/components/instructor-course-offering-detail";

interface InstructorCourseOfferingPageProps {
  params: Promise<{
    course_offering_id: string;
  }>;
}

export default async function InstructorCourseOfferingPage({
  params,
}: InstructorCourseOfferingPageProps) {
  const { course_offering_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <InstructorCourseOfferingDetail courseOfferingId={course_offering_id} />
    </div>
  );
}
