import { InstructorLearningRecordDetail } from "@/features/instructor-learning-records/components/instructor-learning-record-detail";

interface InstructorLearningRecordPageProps {
  params: Promise<{
    course_offering_id: string;
    learning_record_id: string;
  }>;
}

export default async function InstructorLearningRecordPage({
  params,
}: InstructorLearningRecordPageProps) {
  const { course_offering_id, learning_record_id } = await params;

  return (
    <div className="mx-auto max-w-7xl">
      <InstructorLearningRecordDetail
        courseOfferingId={course_offering_id}
        learningRecordId={learning_record_id}
      />
    </div>
  );
}
