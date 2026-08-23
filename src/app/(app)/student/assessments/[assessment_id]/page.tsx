import { AssessmentRunner } from "@/features/student-course/components/assessment-runner";

interface AssessmentPageProps {
  params: Promise<{
    assessment_id: string;
  }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { assessment_id } = await params;

  return <AssessmentRunner assessmentId={assessment_id} />;
}
