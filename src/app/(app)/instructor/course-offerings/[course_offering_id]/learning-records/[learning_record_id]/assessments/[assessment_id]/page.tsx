import { InstructorAssessmentResult } from "@/features/instructor-learning-records/components/instructor-assessment-result";

interface InstructorAssessmentResultPageProps {
  params: Promise<{
    course_offering_id: string;
    learning_record_id: string;
    assessment_id: string;
  }>;
}

export default async function InstructorAssessmentResultPage({
  params,
}: InstructorAssessmentResultPageProps) {
  const { course_offering_id, learning_record_id, assessment_id } =
    await params;

  return (
    <InstructorAssessmentResult
      courseOfferingId={course_offering_id}
      learningRecordId={learning_record_id}
      assessmentId={assessment_id}
    />
  );
}
