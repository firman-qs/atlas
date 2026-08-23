import { AssessmentResultView } from "@/features/student-course/components/assessment-result-view";

interface AssessmentResultPageProps {
  params: Promise<{
    assessment_id: string;
  }>;
}

export default async function AssessmentResultPage({
  params,
}: AssessmentResultPageProps) {
  const { assessment_id } = await params;

  return <AssessmentResultView assessmentId={assessment_id} />;
}
